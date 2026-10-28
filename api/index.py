from auth import Config, AuthService
from server import GardenHandler
from youtube_upload import YouTubeService
from r2_images import R2Images
from cloud_store import CloudStore

config = Config.from_env()
store = CloudStore()
if not config.origin.startswith('https://') or not store.configured:
    raise ValueError('Vercel requires an HTTPS APP_ORIGIN and DATABASE_URL.')

# Each worker can restart freely. Request handling loads persistent state under
# a database transaction lock before any session/token use.
auth = AuthService(config)
youtube = YouTubeService(config.origin)
images = R2Images()

class handler(GardenHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, auth=auth, youtube=youtube, images=images, store=store, **kwargs)
