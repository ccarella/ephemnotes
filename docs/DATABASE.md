# Database Schema Documentation

## Overview

EphemNotes uses Supabase (PostgreSQL) as its database backend. The database is configured with Row Level Security (RLS) to ensure data privacy and security.

## Tables

### Posts Table

The `posts` table stores all user-generated content in the application.

#### Schema

| Column     | Type                     | Constraints                                           | Description                         |
| ---------- | ------------------------ | ----------------------------------------------------- | ----------------------------------- |
| id         | UUID                     | PRIMARY KEY, DEFAULT gen_random_uuid()                | Unique identifier for each post     |
| user_id    | UUID                     | NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE | ID of the user who created the post |
| username   | TEXT                     | NOT NULL                                              | Username of the post author         |
| title      | TEXT                     | NOT NULL                                              | Title of the post                   |
| body       | TEXT                     | NULL                                                  | Content of the post                 |
| published  | BOOLEAN                  | DEFAULT false                                         | Whether the post is published       |
| created_at | TIMESTAMP WITH TIME ZONE | DEFAULT now()                                         | When the post was created           |
| updated_at | TIMESTAMP WITH TIME ZONE | DEFAULT now()                                         | When the post was last updated      |

#### Constraints

- `unique_user_posts`: Ensures that each user can only have one post with the same title (user_id, title)

#### Triggers

- `update_posts_updated_at`: Automatically updates the `updated_at` column when a row is modified

## Row Level Security (RLS)

RLS is enabled on the posts table with the following policies:

### Read Policy: "Posts are viewable by everyone"

- **Operation**: SELECT
- **Check**: `true`
- **Description**: All posts can be read by anyone, including anonymous users

### Insert Policy: "Users can insert their own posts"

- **Operation**: INSERT
- **Check**: `auth.uid() = user_id`
- **Description**: Users can only create posts where they are the author

### Update Policy: "Users can update their own posts"

- **Operation**: UPDATE
- **Using**: `auth.uid() = user_id`
- **With Check**: `auth.uid() = user_id`
- **Description**: Users can only update their own posts

## TypeScript Types

TypeScript types are generated and available in `src/lib/database.types.ts`. The main types for posts are:

```typescript
// Type for a post row from the database
type Post = Tables<'posts'>

// Type for inserting a new post
type PostInsert = TablesInsert<'posts'>

// Type for updating a post
type PostUpdate = TablesUpdate<'posts'>
```

## Helper Functions

Post-related database operations are abstracted in `src/lib/posts.ts`:

- `getPosts()`: Fetch all posts ordered by creation date
- `getPostById()`: Fetch a single post by ID
- `getPostsByUserId()`: Fetch all posts by a specific user
- `createPost()`: Create a new post
- `updatePost()`: Update an existing post
- `deletePost()`: Delete a post

## Migrations

Database migrations are stored in `supabase/migrations/` and are applied automatically when:

1. A Supabase development branch is created
2. Changes are merged to production

Current migrations:

- `20241223_create_posts_table.sql`: Creates the posts table with RLS policies

## Development Setup

1. Ensure you have the required environment variables in `.env.local`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. When working with database changes:
   - Create new migration files in `supabase/migrations/`
   - Use timestamp prefixes for ordering (e.g., `20241223_description.sql`)
   - Include both schema changes and RLS policies in migrations

3. Testing:
   - Unit tests for database operations are in `src/lib/posts.test.ts`
   - E2E tests that will validate database functionality are in `tests/posts.spec.ts`

## Security Considerations

- RLS policies ensure users can only modify their own content
- The `auth.uid()` function is used to identify the current user
- All database access goes through Supabase's secure API
- Anonymous users can read posts but cannot create or modify them
