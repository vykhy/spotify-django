from .models import SpotifyToken
from django.utils import timezone
from datetime import timedelta
from requests import post, put, get

BASE_URL='https://api.spotify.com/v1/me/'

# get tokens of current user and return the first one (only one should exist)
def get_user_tokens(session_id):
    user_tokens = SpotifyToken.objects.filter(user=session_id)
    if user_tokens.exists():
        return user_tokens[0]
    return None

# update or create tokens if not already exists
def update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token):
    tokens = get_user_tokens(session_id)
    expires_in = timezone.now() + timedelta(seconds=expires_in)

    # if tokens exist, update it
    if tokens:
        tokens.access_token = access_token
        tokens.refresh_token = refresh_token
        tokens.expires_in = expires_in
        tokens.token_type = token_type
        tokens.save(update_fields=['access_token', 'refresh_token', 'expires_in', 'token_type'])
    # else create a new token set
    else:
        tokens = SpotifyToken(user=session_id, access_token=access_token, refresh_token=refresh_token, expires_in=expires_in, token_type=token_type)
        tokens.save()

# check if authenticated with spotify and refresh tokens if expired
def is_spotify_authenticated(session_id):
    tokens = get_user_tokens(session_id)
    if tokens:
        expiry = tokens.expires_in
        if expiry <= timezone.now():
            refresh_spotify_token(session_id)

        return True    
    return False

# refresh spotify token with refresh_token
def refresh_spotify_token(session_id):
    refresh_token = get_user_tokens(session_id).refresh_token

    # hit spotify api to refresh token
    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'refresh_token',
        'refresh_token': refresh_token,
        'client_id': env('CLIENT_ID'),
        'client_secret': env('CLIENT_SECRET')
    }).json()

    # extract new tokens
    access_token = response.get('access_token')
    token_type = response.get('token_type')
    expires_in = response.get('expires_in')

    # update user tokens 
    update_or_create_user_tokens(session_id, access_token, token_type, expires_in, refresh_token)

# helper function to call spotify api
def execute_spotify_api_request(session_id, endpoint, post_=False, put_=False):
    tokens = get_user_tokens(session_id)
    header = {'Content-Type':'application/json', 'Authorization': 'Bearer '+tokens.access_token}

    # if post request
    if post_:
        post(BASE_URL + endpoint, headers=header)
    # if put request
    elif put_:
        put(BASE_URL + endpoint, headers=header)
    # else it is a get request
    else:
        response = get(BASE_URL + endpoint, {}, headers=header)
        try:
            return response.json()
        except:
            return{'Error', 'Issue with request'}

# call spotify api to play song
def play_song(session_id):
    return execute_spotify_api_request(session_id, 'player/play', put_=True)

# call spotify api to pause song
def pause_song(session_id):
    return execute_spotify_api_request(session_id, 'player/pause', put_=True)

