# Project Rules

## Database Constraints
- **CRITICAL:** DO NOT use `supabase db reset`. This command drops all data and re-seeds it. The user has explicitly stated that user, admin, superadmin, developer data, and uploaded manhwa data MUST be preserved and left intact.
- If a database schema change is required, create a new migration file and apply it directly (e.g. via `psql` or `supabase migration up`), or instruct the user to run it without resetting the database.
- Any manual SQL scripts or operations must safely `ALTER` or `UPDATE` existing data without wiping the tables.
