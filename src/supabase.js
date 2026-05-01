import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://igvmcwiwvyoylywffwwg.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlndm1jd2l3dnlveWx5d2Zmd3dnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NTYyMDYsImV4cCI6MjA5MzIzMjIwNn0.ln8dX_Sk6W30D8QkIbySwwY7-F9_VfbFqXwAr-rIXUo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
