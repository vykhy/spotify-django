from django.shortcuts import render, redirect
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
import environ

env = environ.Env()

# Create your views here.
# returns url for authenticating with spotify
class AuthURL(APIView):
    def get(self, request, format=None):
        # user permission scope
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        # generate url to authenticate/authorize user and send to frontend
        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': env('REDIRECT_URI'),
            'client_id': env('CLIENT_ID')
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)

# handles after authenticating with spotify
def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    # post to spotify api for authorization
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': env('REDIRECT_URI'),
        'client_id': env('CLIENT_ID'),
        'client_secret': env('CLIENT_SECRET')
    }).json()

    # extract response from spotify api
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    # check and create session for current user if it does not already exist
    if not request.session.exists(request.session.session_key):
        request.session.create()

    # create tokens or update tokens if already exists
    update_or_create_user_tokens(request.session.session_key, access_token, token_type, expires_in, refresh_token)
    return redirect('frontend:')

# check whether authenticated with spotify 
class IsAuthenticated(APIView):
    def get(self, request, format=None):
        # check and return whether already authenticated with spotify
        is_authenticated = is_spotify_authenticated(self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)

# gets current song
class  CurrentSong(APIView):
    def get(self, request, format=None):
        # get room and prepare endpoint
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = 'player/currently-playing'

        # hit spotify API to get current song
        response = execute_spotify_api_request(host, endpoint)

        # return 204 if error or response does not contain item
        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        # extract from response
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        # format artists into a single string
        artist_string = ''
        for i, artist in enumerate(item.get('artists')):
            if i>0:
                artist_string += ', '
            artist_string +=  artist.get('name')
        
        # format data and return response
        song={
            'title': item.get('name'),
            'artist': artist_string,
            'image_url': album_cover,
            'duration': duration,
            'time': progress,
            'is_playing': is_playing,
            'votes': 0,
            'id': song_id
        }

        return Response(song, status=status.HTTP_200_OK)

# pause current song
class PauseSong(APIView):
    def put(self, response, format=None):
        # get room of current user
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        # hit spotify api to pause song if user is host, or room allows guests to pause
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

# pause current song
class PlaySong(APIView):
    def put(self, response, format=None):
        # get room of current user
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        # hit spotify api to play song if user is host, or room allows guests to pause
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        return Response({}, status=status.HTTP_403_FORBIDDEN)

