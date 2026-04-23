-- ============================================================================
-- TASKS APP: Complete Database Schema + Row-Level Security Policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE (User profiles synced from auth.users)
-- ============================================================================
-- ============================================================================
-- HELPER FUNCTION: Auto-update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'archived')),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_permissions (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, user_id)
);


-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS: Users can read all profiles (for sharing/permissions UI)
CREATE POLICY "Profiles are readable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- RLS: Users can only update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS: Users can only insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-update updated_at timestamp on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. TASKS TABLE (Tasks with priority, status, created_by)
-- ============================================================================

-- Indexes for performance
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

-- Enable RLS on tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view tasks they created OR tasks shared with them
CREATE POLICY "Users can view their own tasks and shared tasks"
  ON tasks FOR SELECT
  USING (
    created_by = auth.uid()
    OR id IN (
      SELECT task_id FROM task_permissions
      WHERE user_id = auth.uid()
    )
  );

-- RLS: Users can only insert tasks with created_by = their own id
CREATE POLICY "Users can only create tasks as themselves"
  ON tasks FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- RLS: Users can update if they own the task OR have editor role
CREATE POLICY "Users can update their own tasks or shared editor tasks"
  ON tasks FOR UPDATE
  USING (
    created_by = auth.uid()
    OR id IN (
      SELECT task_id FROM task_permissions
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

-- RLS: Only the owner can delete
CREATE POLICY "Only task owner can delete"
  ON tasks FOR DELETE
  USING (created_by = auth.uid());

-- Auto-update updated_at timestamp on tasks
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. TOPICS TABLE (User-defined task categories)
-- ============================================================================

CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, created_by) -- Each user has unique topic names
);

-- Indexes
CREATE INDEX idx_topics_created_by ON topics(created_by);

-- Enable RLS on topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own topics and topics shared with them (via task sharing)
CREATE POLICY "Users can view their own topics"
  ON topics FOR SELECT
  USING (created_by = auth.uid());

-- RLS: Users can only create topics as themselves
CREATE POLICY "Users can only create topics as themselves"
  ON topics FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- RLS: Users can only update their own topics
CREATE POLICY "Users can only update their own topics"
  ON topics FOR UPDATE
  USING (created_by = auth.uid());

-- RLS: Users can only delete their own topics
CREATE POLICY "Users can only delete their own topics"
  ON topics FOR DELETE
  USING (created_by = auth.uid());

-- Auto-update updated_at
CREATE TRIGGER update_topics_updated_at
  BEFORE UPDATE ON topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Helper function to verify task ownership without recursive policy evaluation
CREATE OR REPLACE FUNCTION is_task_owner(task_id UUID)
RETURNS BOOLEAN AS $$
  SELECT created_by = auth.uid()
  FROM tasks
  WHERE id = task_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- ============================================================================
-- 4. TASK_TOPICS TABLE (Many-to-many: tasks to topics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_topics (
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, topic_id)
);

-- Indexes
CREATE INDEX idx_task_topics_topic_id ON task_topics(topic_id);

-- Enable RLS on task_topics
ALTER TABLE task_topics ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view task_topics for tasks they can see
CREATE POLICY "Users can view task_topics for accessible tasks"
  ON task_topics FOR SELECT
  USING (
    is_task_owner(task_id)
    OR task_id IN (
      SELECT task_id FROM task_permissions
      WHERE user_id = auth.uid()
    )
  );

-- RLS: Users can insert task_topics only for tasks they can edit
CREATE POLICY "Users can add topics to tasks they can edit"
  ON task_topics FOR INSERT
  WITH CHECK (
    is_task_owner(task_id)
    OR task_id IN (
      SELECT task_id FROM task_permissions
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

-- RLS: Users can delete task_topics only for tasks they can edit
CREATE POLICY "Users can remove topics from tasks they can edit"
  ON task_topics FOR DELETE
  USING (
    is_task_owner(task_id)
    OR task_id IN (
      SELECT task_id FROM task_permissions
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

-- ============================================================================
-- 5. TASK_PERMISSIONS TABLE (Task sharing with roles: viewer, editor)
-- ============================================================================

-- Indexes
CREATE INDEX idx_task_permissions_user_id ON task_permissions(user_id);
CREATE INDEX idx_task_permissions_shared_at ON task_permissions(shared_at DESC);

-- Enable RLS on task_permissions
ALTER TABLE task_permissions ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view permissions for tasks they own or have access to
CREATE POLICY "Users can view permissions for accessible tasks"
  ON task_permissions FOR SELECT
  USING (
    is_task_owner(task_id)
    OR user_id = auth.uid()
  );

-- RLS: Only the task owner can insert permissions (share a task)
CREATE POLICY "Only task owner can share tasks"
  ON task_permissions FOR INSERT
  WITH CHECK (
    is_task_owner(task_id)
  );

-- RLS: Owner can update permissions, and editors can remove their own access
CREATE POLICY "Owner can update permissions; users can remove their own"
  ON task_permissions FOR UPDATE
  USING (
    is_task_owner(task_id)
    OR (user_id = auth.uid()) -- User can modify their own access level (if owner allows)
  );

-- RLS: Owner can delete, or user can remove themselves
CREATE POLICY "Owner can remove permissions; users can remove their own"
  ON task_permissions FOR DELETE
  USING (
    is_task_owner(task_id)
    OR user_id = auth.uid() -- User can remove themselves
  );

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. All tables use UUID primary keys for scalability
-- 2. Timestamps: created_at (immutable), updated_at (auto-updated)
-- 3. RLS policies enforce access control at DB layer (frontend is untrusted)
-- 4. Foreign keys use CASCADE delete for clean data removal
-- 5. Indexes on frequently filtered/joined columns (created_by, status, etc.)
-- 6. Unique constraints where needed (profiles.email, topics per user)
