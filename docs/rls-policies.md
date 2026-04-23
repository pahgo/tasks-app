# Row Level Security (RLS)

## Core Rule

A user can access a task if:

* they created it
* OR it is shared with them

## Policies

### SELECT tasks

User can view own or shared tasks

### INSERT tasks

User can only create tasks with created_by = auth.uid()

### UPDATE tasks

Allowed if:

* owner
* OR role = editor

### DELETE tasks

Only owner

### task_permissions

* Only owners can share tasks
* Editors may remove access

## Principle

Frontend is NOT trusted.
All access control must be enforced via RLS.
