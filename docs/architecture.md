# Architecture

## Layers

### 1. API Layer

Supabase client

### 2. Service Layer

Encapsulates DB logic (tasks, sharing)

### 3. Hooks Layer

React Query hooks

### 4. UI Layer

React components

## Stack

* React
* Supabase
* React Query

## Principles

* No direct DB calls in components
* Use hooks for all data access
* Cache and invalidate using React Query
