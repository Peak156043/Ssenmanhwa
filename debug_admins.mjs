import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: admins, error: adminErr } = await supabase
    .from('admin_users')
    .select(`
      id,
      role,
      last_login_at,
      users (
        username
      )
    `)
    .order('role', { ascending: false });

  console.log('admins:', JSON.stringify(admins, null, 2));
  console.log('error:', adminErr);
}

main();
