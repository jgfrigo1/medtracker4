import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your Supabase project's URL and Anon Key
const supabaseUrl = process.env.SUPABASE_URL || postgresql://postgres:1Thematrix!@db.tsfazkphbnwpksbscogg.supabase.co:5432/postgres;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZmF6a3BoYm53cGtzYnNjb2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODUzMDksImV4cCI6MjA3NzI2MTMwOX0.VFlPPKQ2UuAoqxIFnpHP2YQDDLuXVjuTXtHkMW_A3yw;

if (supabaseUrl === postgresql://postgres:1Thematrix!@db.tsfazkphbnwpksbscogg.supabase.co:5432/postgres || supabaseAnonKey === eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZmF6a3BoYm53cGtzYnNjb2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODUzMDksImV4cCI6MjA3NzI2MTMwOX0.VFlPPKQ2UuAoqxIFnpHP2YQDDLuXVjuTXtHkMW_A3yw) {
    console.warn('Supabase URL or Anon Key is not configured. Please update services/supabase.ts');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
