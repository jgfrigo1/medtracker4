import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tsfazkphbnwpksbscogg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZmF6a3BoYm53cGtzYnNjb2dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODUzMDksImV4cCI6MjA3NzI2MTMwOX0.VFlPPKQ2UuAoqxIFnpHP2YQDDLuXVjuTXtHkMW_A3yw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
