"""Apply the private schema explicitly before deployment."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from auth import load_local_env
from cloud_store import CloudStore
load_local_env(Path(__file__).resolve().parent.parent)
store = CloudStore()
if not store.configured:
    raise SystemExit('Set DATABASE_URL and SESSION_ENCRYPTION_KEY in .env.local first.')
try:
    store.initialize()
    print('Supabase private schema ready.')
except Exception:
    raise SystemExit('Database setup failed. Check DATABASE_URL and database privileges; no credentials were logged.') from None
