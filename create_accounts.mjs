import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'; // service_role key

const supabase = createClient(supabaseUrl, supabaseKey);

const accounts = [
  { username: 'Developer', email: 'developer@example.com', password: '12345678', role: 'developer' },
  { username: 'Super Admin', email: 'superadmin@example.com', password: '12345678', role: 'superadmin' },
  { username: 'Admin', email: 'admin@example.com', password: '12345678', role: 'admin' },
  { username: 'User01', email: 'user01@example.com', password: '12345678', role: null }, // user account
];

async function setupAccount(acc) {
  console.log(`\nSetting up ${acc.email}...`);
  
  let userId;

  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: acc.email,
    password: acc.password,
    email_confirm: true,
    user_metadata: { username: acc.username }
  });

  if (authError) {
    if (authError.code === 'email_exists' || authError.message.includes('already registered')) {
        console.log('User already exists, finding ID...');
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        const existing = users.users.find(u => u.email === acc.email);
        
        if (existing) {
            userId = existing.id;
            
            // Also attempt to update password to match exactly what user asked
            await supabase.auth.admin.updateUserById(userId, { password: acc.password });
        }
    } else {
        console.error('Error creating user:', authError);
        return;
    }
  } else {
      userId = authData.user.id;
      console.log('User created successfully. ID:', userId);
      console.log('Waiting 1 second for public.users trigger to finish...');
      await new Promise(r => setTimeout(r, 1000));
  }

  // 2. Insert into admin_users if role is specified
  if (acc.role) {
    console.log(`Assigning ${acc.role} role...`);
    const { error: adminError } = await supabase.from('admin_users').upsert({
        id: userId,
        role: acc.role
    }, { onConflict: 'id' });

    if (adminError) {
        console.error('Error assigning role:', adminError);
    } else {
        console.log(`Successfully assigned ${acc.role} role!`);
    }
  } else {
    // If not admin, ensure they are removed from admin_users just in case
    await supabase.from('admin_users').delete().eq('id', userId);
    console.log('Regular user - no admin role assigned.');
  }
}

async function main() {
  for (const acc of accounts) {
    await setupAccount(acc);
  }
  console.log('\nAll accounts processed.');
}

main();
