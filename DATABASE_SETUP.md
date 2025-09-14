# Stride Database Setup Guide

This guide will help you set up the Supabase database for syncing todos in the Stride application.

## Prerequisites

1. A Supabase account and project
2. Access to your Supabase SQL Editor
3. Proper environment variables configured in your `.env.local` file

## Step 1: Environment Variables

Make sure your `.env.local` file contains:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 2: Database Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL script from `sql/create_trackers_table.sql`

This will create:

- `trackers` table with proper schema
- Row Level Security (RLS) policies
- Performance indexes
- Auto-updating timestamp triggers

## Step 3: Verify Setup

After running the SQL script, verify:

1. **Table Creation**: Check that the `trackers` table exists in your Database section
2. **RLS Policies**: Ensure RLS is enabled and policies are active
3. **Indexes**: Confirm indexes are created for performance

## How the Sync System Works

### Authentication-Based Sync

- **Login**: Automatically syncs cloud data to local storage
- **Logout**: Clears all local storage data
- **Data Conflicts**: Shows modal to resolve conflicts between local and cloud data

### Edge Cases Handled

1. **Local Data + Cloud Data**: User chooses to merge, keep local, or keep cloud
2. **Network Issues**: Falls back to local storage with error indicators
3. **Session Restoration**: Syncs on page refresh if authenticated

### Conflict Resolution Options

1. **Merge (Recommended)**: Combines both datasets, avoiding duplicates
2. **Keep Cloud**: Discards local data, uses cloud data
3. **Keep Local**: Overwrites cloud with local data

## Data Flow

```
Login → Check for conflicts → Resolve → Sync to cloud
  ↓
Use app normally (auto-sync every action)
  ↓
Logout → Clear local storage
```

## Troubleshooting

### ⚡ IMMEDIATE FIX for RLS Error 42501

If you're getting "new row violates row-level security policy" errors, run this in your Supabase SQL Editor **RIGHT NOW**:

```sql
-- Quick fix: Disable RLS temporarily to test the app
ALTER TABLE public.trackers DISABLE ROW LEVEL SECURITY;
```

**⚠️ Important**: This temporarily disables security. After confirming the app works, follow the steps below to properly configure RLS.

### 🔒 Proper RLS Setup (Run after the immediate fix)

Once you've confirmed the app works with RLS disabled, run this to properly secure your database:

```sql
-- Step 1: Re-enable RLS
ALTER TABLE public.trackers ENABLE ROW LEVEL SECURITY;

-- Step 2: Create proper policies
CREATE POLICY "Users can view their own trackers" ON public.trackers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trackers" ON public.trackers
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trackers" ON public.trackers
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trackers" ON public.trackers
    FOR DELETE USING (auth.uid() = user_id);
```

### Common Issues

1. **NULL user_id Constraint Violation (Error Code 23502)**:

   - **Error**: `null value in column "user_id" of relation "trackers" violates not-null constraint`
   - **Cause**: The application is trying to insert records without setting the user_id field
   - **Solution**: This indicates an authentication issue where `auth.uid()` is returning null

   **Debug Steps**:

   ```sql
   -- Test 1: Check if you're properly authenticated
   SELECT auth.uid() as current_user_id;
   -- Should return your user ID, not null

   -- ⚠️ IF auth.uid() RETURNS NULL (like in your case):
   -- This means you're not authenticated in the SQL Editor
   -- SOLUTION: Temporarily disable RLS to let your app handle user_id directly

   -- Test 2: Check your current session
   SELECT auth.jwt();
   -- Should return session information

   -- Test 3: Manual insert test (replace YOUR_USER_ID with result from Test 1)
   INSERT INTO trackers (user_id, title, description)
   VALUES ('YOUR_USER_ID', 'Test Task', 'Test Description');
   ```

   **If auth.uid() returns null (YOUR CURRENT SITUATION)**:

   **IMMEDIATE FIX - Run this command in Supabase SQL Editor:**

   ```sql
   -- This will allow your app to insert records with explicit user_id values
   ALTER TABLE public.trackers DISABLE ROW LEVEL SECURITY;
   ```

   **Why this works:**

   - Your app code is correctly setting `user_id` in the TrackerSyncService
   - The issue is that RLS policies expect `auth.uid()` to work in the database context
   - Since you're not authenticated in the SQL Editor context, `auth.uid()` returns null
   - Disabling RLS lets your app handle user isolation at the application level

   **Alternative - If you want to keep RLS enabled:**

   ```sql
   -- Create policies that allow any authenticated user (relies on app-level security)
   DROP POLICY IF EXISTS "Users can view their own trackers" ON public.trackers;
   DROP POLICY IF EXISTS "Users can insert their own trackers" ON public.trackers;
   DROP POLICY IF EXISTS "Users can update their own trackers" ON public.trackers;
   DROP POLICY IF EXISTS "Users can delete their own trackers" ON public.trackers;

   -- Create permissive policies for authenticated users
   CREATE POLICY "Allow authenticated access" ON public.trackers
       FOR ALL USING (auth.role() = 'authenticated');
   ```

   **Additional App Debugging**:

   ```javascript
   // Add this to your browser console to debug the auth state
   console.log("Auth Debug:", {
     user: window.authUser,
     session: window.authSession,
     userId: window.authUser?.id,
   });
   ```

   **If the problem persists, temporarily add this debug code to your app**:

   1. Add the AuthDebugger component to your home page:

   ```typescript
   // In app/home/page.tsx, import and add:
   import { AuthDebugger } from "@/components/AuthDebugger";

   // Add <AuthDebugger /> somewhere in your JSX
   ```

   2. Or add this debug logging in `hooks/useTrackersWithSync.ts`:

   ```typescript
   // Add this in the syncToCloud function before calling saveTrackers
   console.log("Sync Debug:", {
     user: user,
     userId: user?.id,
     hasSession: !!session,
     trackersCount: updatedTrackers.length,
   });
   ```

**Expected Results**:

- `user.id` should be a valid UUID string, not null
- `session` should exist with an `access_token`
- If either is null, the issue is with authentication, not database policies

2. **RLS Errors (Error Code 42501)**:

   - **Cause**: Row Level Security policies are blocking database access
   - **Solution**: Ensure RLS policies are properly configured in your Supabase project
   - **Check**: Go to Supabase Dashboard → Authentication → Policies → `trackers` table
   - **Verify**: All four policies should be enabled (SELECT, INSERT, UPDATE, DELETE)

3. **"Permission denied" errors**:

   - **Cause**: User authentication token may be invalid or expired
   - **Solution**: Log out and log back in to refresh authentication
   - **Check**: Verify `auth.uid()` function works in Supabase SQL editor

4. **Sync Failures**: Check network connection and Supabase credentials

5. **Type Errors**: Verify database schema matches TypeScript types

### Debug Steps for RLS Issues

If you're getting "new row violates row-level security policy" errors:

1. **Verify RLS Policies Exist**:

   ```sql
   -- Run this in Supabase SQL Editor to check policies
   SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
   FROM pg_policies
   WHERE tablename = 'trackers';
   ```

2. **Test User Authentication**:

   ```sql
   -- Run this while logged in to verify auth.uid() works
   SELECT auth.uid() as current_user_id;
   ```

3. **Manually Test Insert Permission**:

   ```sql
   -- Try inserting a test record (replace USER_ID with actual auth.uid())
   INSERT INTO trackers (user_id, title, description)
   VALUES (auth.uid(), 'Test Task', 'Test Description');
   ```

4. **Re-create Policies if Needed**:

   ```sql
   -- STEP 1: First, disable RLS temporarily to test
   ALTER TABLE public.trackers DISABLE ROW LEVEL SECURITY;

   -- STEP 2: Drop existing policies (if any)
   DROP POLICY IF EXISTS "Users can view their own trackers" ON public.trackers;
   DROP POLICY IF EXISTS "Users can insert their own trackers" ON public.trackers;
   DROP POLICY IF EXISTS "Users can update their own trackers" ON public.trackers;
   DROP POLICY IF EXISTS "Users can delete their own trackers" ON public.trackers;

   -- STEP 3: Re-enable RLS
   ALTER TABLE public.trackers ENABLE ROW LEVEL SECURITY;

   -- STEP 4: Create new policies with proper syntax
   CREATE POLICY "Users can view their own trackers" ON public.trackers
       FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert their own trackers" ON public.trackers
       FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update their own trackers" ON public.trackers
       FOR UPDATE USING (auth.uid() = user_id)
       WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can delete their own trackers" ON public.trackers
       FOR DELETE USING (auth.uid() = user_id);
   ```

5. **IMMEDIATE FIX - If the above doesn't work, temporarily disable RLS**:

   ```sql
   -- WARNING: This disables security temporarily for testing
   -- Only use this to verify the app works, then re-enable with proper policies
   ALTER TABLE public.trackers DISABLE ROW LEVEL SECURITY;
   ```

6. **Verify the fix**:

   ```sql
   -- Test that policies are working
   SELECT
     schemaname,
     tablename,
     policyname,
     cmd as command,
     permissive,
     roles,
     qual as using_clause,
     with_check
   FROM pg_policies
   WHERE tablename = 'trackers';

   -- Should return 4 rows (SELECT, INSERT, UPDATE, DELETE policies)
   ```

### Debug Tips

- Check browser console for sync errors
- Verify user authentication status
- Check Supabase dashboard for failed requests
- Test with both local and cloud data scenarios
- **Important**: If RLS errors persist, contact your database administrator or check Supabase project settings

## Testing the Implementation

1. **Test 1**: Create tasks while logged out, then log in → Should see conflict modal
2. **Test 2**: Create tasks while logged in, refresh page → Should maintain data
3. **Test 3**: Log out and back in → Should sync cloud data
4. **Test 4**: Create tasks on multiple devices → Should sync across devices

## Security Features

- Row Level Security ensures users only access their own data
- User ID validation on all database operations
- Automatic data isolation per user account
- Secure authentication through Supabase Auth

## Performance Optimizations

- Debounced sync (1 second delay) to avoid excessive API calls
- Indexed database queries for fast retrieval
- Local-first architecture for immediate UI updates
- Background sync for seamless user experience
