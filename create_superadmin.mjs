import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // service_role key
const email = 'developer@example.com';
const password = 'password123';
const username = 'Developer';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log(`Setting up ${email}...`);
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { username }
  });

  if (authError) {
    if (authError.code === 'email_exists' || authError.message.includes('already registered')) {
        console.log('User already exists, finding ID...');
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        const existing = users.users.find(u => u.email === email);
        
        if (existing) {
             const { error: adminError } = await supabase.from('admin_users').insert({
                id: existing.id,
                role: 'developer'
              });
              if (adminError && adminError.code !== '23505') {
                 console.error('Error assigning role:', adminError);
              } else {
                 console.log('Successfully assigned developer role to existing user!');
              }
        }
    } else {
        console.error('Error creating user:', authError);
    }
    return;
  }

  console.log('User created successfully. ID:', authData.user.id);

  console.log('Waiting 1 second for public.users trigger to finish...');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Assigning developer role...');
  // 2. Insert into admin_users
  const { error: adminError } = await supabase.from('admin_users').insert({
    id: authData.user.id,
    role: 'developer'
  });

  if (adminError) {
    console.error('Error assigning role:', adminError);
  } else {
    console.log('Successfully assigned developer role!');
  }
}

main();
