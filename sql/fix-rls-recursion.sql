-- Fix for infinite recursion in RLS policies between tasks, task_topics, and task_permissions.

-- Helper function to check task ownership without triggering recursive policy evaluation.
CREATE OR REPLACE FUNCTION is_task_owner(task_id UUID)
RETURNS BOOLEAN AS $$
  SELECT created_by = auth.uid()
  FROM tasks
  WHERE id = task_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Update task_topics policies
DROP POLICY IF EXISTS "Users can view task_topics for accessible tasks" ON task_topics;
DROP POLICY IF EXISTS "Users can add topics to tasks they can edit" ON task_topics;
DROP POLICY IF EXISTS "Users can remove topics from tasks they can edit" ON task_topics;

CREATE POLICY "Users can view task_topics for accessible tasks"
  ON task_topics FOR SELECT
  USING (
    is_task_owner(task_id)
    OR task_id IN (
      SELECT task_id FROM task_permissions
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add topics to tasks they can edit"
  ON task_topics FOR INSERT
  WITH CHECK (
    is_task_owner(task_id)
    OR task_id IN (
      SELECT task_id FROM task_permissions
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

CREATE POLICY "Users can remove topics from tasks they can edit"
  ON task_topics FOR DELETE
  USING (
    is_task_owner(task_id)
    OR task_id IN (
      SELECT task_id FROM task_permissions
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

-- Update task_permissions policies
DROP POLICY IF EXISTS "Users can view permissions for accessible tasks" ON task_permissions;
DROP POLICY IF EXISTS "Only task owner can share tasks" ON task_permissions;
DROP POLICY IF EXISTS "Owner can update permissions; users can remove their own" ON task_permissions;
DROP POLICY IF EXISTS "Owner can remove permissions; users can remove their own" ON task_permissions;

CREATE POLICY "Users can view permissions for accessible tasks"
  ON task_permissions FOR SELECT
  USING (
    is_task_owner(task_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "Only task owner can share tasks"
  ON task_permissions FOR INSERT
  WITH CHECK (
    is_task_owner(task_id)
  );

CREATE POLICY "Owner can update permissions; users can remove their own"
  ON task_permissions FOR UPDATE
  USING (
    is_task_owner(task_id)
    OR user_id = auth.uid()
  );

CREATE POLICY "Owner can remove permissions; users can remove their own"
  ON task_permissions FOR DELETE
  USING (
    is_task_owner(task_id)
    OR user_id = auth.uid()
  );
