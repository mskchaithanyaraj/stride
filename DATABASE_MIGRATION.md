# Database Migration Instructions

## Custom Categories Table Setup

The app now uses a `custom_categories` table to store user-created categories. You need to run this SQL migration in your Supabase dashboard.

### Steps:

1. **Open Supabase Dashboard**

   - Go to https://supabase.com/dashboard
   - Select your project: `csglbrvooolacfhhlxdr`

2. **Navigate to SQL Editor**

   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the SQL**

   - Open the file: `sql/create_custom_categories_table.sql`
   - Copy all the SQL code
   - Paste it into the SQL Editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

4. **Verify the Table**
   - Go to "Table Editor" in the left sidebar
   - You should see a new table called `custom_categories`
   - It should have the following columns:
     - `id` (UUID)
     - `user_id` (UUID)
     - `name` (TEXT)
     - `icon` (TEXT)
     - `color` (TEXT)
     - `created_at` (TIMESTAMP)
     - `updated_at` (TIMESTAMP)

### What This Migration Does:

- ✅ Creates the `custom_categories` table
- ✅ Adds Row Level Security (RLS) policies so users can only see their own categories
- ✅ Adds a constraint to limit users to 5 custom categories maximum
- ✅ Adds automatic timestamp triggers for `updated_at`

### After Migration:

Once the migration is complete:

- Refresh your app
- The "Failed to load categories" errors will disappear
- You'll be able to click the "+" icon in the category bar to add custom categories
- Custom categories will sync to the database and persist across sessions

### Troubleshooting:

If you see errors after running the migration:

1. Make sure you're in the correct project
2. Check that RLS is enabled on the table
3. Verify the policies are created (Table Editor → Policies tab)
4. Try refreshing the app's page

---

**Note:** Until you run this migration, the app will work fine but custom categories won't be saved. You can still use the default categories (All, Urgent, Completed, In Progress, Not Started).
