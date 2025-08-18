from supabase import create_client, Client
import os

def supabase_client():
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_key: str = os.getenv("SUPABASE_KEY")
    supabase: Client = create_client(supabase_url, supabase_key)
    return supabase