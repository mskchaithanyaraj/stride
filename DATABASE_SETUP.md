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

### Common Issues

1. **RLS Errors**: Ensure user is authenticated and policies allow access
2. **Sync Failures**: Check network connection and Supabase credentials
3. **Type Errors**: Verify database schema matches TypeScript types

### Debug Tips

- Check browser console for sync errors
- Verify user authentication status
- Check Supabase dashboard for failed requests
- Test with both local and cloud data scenarios

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
