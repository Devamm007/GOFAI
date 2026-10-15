import os
import sys

# Ensure repository root is on sys.path so 'backend' can be resolved by Vercel Serverless
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.src.api.main import app

# Vercel Python runtime detects the exported ASGI `app`
