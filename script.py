import sys
import os
from instaloader import Instaloader, Post

url = sys.argv[1]

loader = Instaloader()

shortcode = url.split('/')[-2]

try:
    post = Post.from_shortcode(loader.context, shortcode)
    loader.download_post(post, target=shortcode)

    video_folder = f"./{shortcode}/{shortcode}/"
    video_files = [f for f in os.listdir(video_folder) if f.endswith('.mp4')]

    if not video_files:
        raise Exception("No video files found.")

    latest_video = sorted(video_files)[-1]
    full_path = os.path.join(video_folder, latest_video)

    print(full_path)
except Exception as e:
    print(f"Error: {str(e)}", file=sys.stderr)
    sys.exit(1)
