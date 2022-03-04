from django.urls import path
from .views import RoomView, CreateRoomView, GetRoom, JoinRoom, UserInRoom, LeaveRoom, UpdateRoom

urlpatterns = [
    path('', RoomView.as_view()),
    path('create', CreateRoomView.as_view()),   # create a room
    path('get-room', GetRoom.as_view()),        # fetch a room
    path('join-room', JoinRoom.as_view()),      # join a room
    path('user-in-room', UserInRoom.as_view()), # check and automatically join if user was in a room
    path('leave-room', LeaveRoom.as_view()),    # leave room
    path('update-room', UpdateRoom.as_view())   # update room
]