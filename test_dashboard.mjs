import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'developer@example.com',
    password: '12345678'
  });
  
  if (error) {
    console.error('Login error:', error);
    return;
  }
  
  console.log('Logged in successfully!');
  const token = data.session.access_token;
  
  // Try to hit the dashboard endpoint
  try {
    const res = await fetch('http://localhost:3001/admin', {
      headers: {
        'Cookie': `sb-access-token=${token}; sb-refresh-token=${data.session.refresh_token}`
      }
    });
    console.log('Dashboard status:', res.status);
    const text = await res.text();
    if (text.includes('Error') || text.includes('Unhandled Runtime Error')) {
      console.log('Found error in HTML!');
      const match = text.match(/<title>.*?Error.*?<\/title>|Error: .*?<\/div>/);
      console.log(match ? match[0] : 'Could not extract error snippet.');
    fs.writeFileSync('dashboard_test_output.html', text);
    console.log('Saved to dashboard_test_output.html');
    }
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

test();
