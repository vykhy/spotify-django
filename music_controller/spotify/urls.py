from django.urls import path
from .views import *

urlpatterns = [
    path('get-auth-url', AuthURL.as_view()),                # get url to authenticate host
    path('redirect', spotify_callback),                     # redirect after authenticating with spotify
    path('is-authenticated', IsAuthenticated.as_view()),    # check if host is authenticated with spotify
    path('current-song', CurrentSong.as_view()),            # get current song
    path('pause', PauseSong.as_view()),                     # pause current song
    path('play', PlaySong.as_view()),                       # unpause/play current song
    path('skip', SkipSong.as_view()),                       # handle skip song request
]
