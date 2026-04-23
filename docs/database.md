# Database Design

## Tables

### tasks

* id
* title
* description
* priority (low, medium, high)
* status (todo, in_progress, done, archived)
* created_by (user_id)
* created_at
* updated_at

### topics

* id
* name
* created_by

### task_topics

* task_id
* topic_id

### task_permissions

* task_id
* user_id
* role (viewer, editor)

### profiles

* id (same as auth.users.id)
* email
* full_name
* avatar_url
* created_at

## Relationships

* tasks.created_by → profiles.id
* task_permissions.user_id → profiles.id
* task_topics.task_id → tasks.id
