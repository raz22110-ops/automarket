import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pghsiondbznscjmmvijz.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnaHNpb25kYnpuc2NqbW12aWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3OTgxOTYsImV4cCI6MjA5MzM3NDE5Nn0.1XbCpdkU1_YflpvYtSJ-cZDdDotGTKbVESu_Cf7E9hA';

export const supabase = createClient(supabaseUrl, supabaseKey);