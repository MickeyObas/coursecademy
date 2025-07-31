# """
# ASGI config for core project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
# """

# import os

# from django.core.asgi import get_asgi_application

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# application = get_asgi_application()


import os

from django.conf import settings
from django.core.asgi import get_asgi_application
from starlette.applications import Starlette
from starlette.middleware.wsgi import WSGIMiddleware
# 👇 Only for static file serving
from starlette.staticfiles import StaticFiles

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")

# Wrap Django ASGI app in Starlette
django_app = get_asgi_application()

app = Starlette()

# Serve static files (e.g., admin CSS/JS)
app.mount("/static", StaticFiles(directory=settings.STATIC_ROOT), name="static")

# Mount Django app
app.mount("/", django_app)
