from django.shortcuts import render
from rest_framework import generics, status
from .serializers import RoomSerializer, CreateRoomSerializer, UpdateRoomSerializer
from .models import Room
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse

# Create your views here.
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

# creates a new room
class CreateRoomView(APIView):
    serializer_class = CreateRoomSerializer

    def post(self, request, format=None):
        # check if user is in session and create if user is not in session
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            # if serializer is valid, extract data from request and fetch room
            # whose host is the current user
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            host = self.request.session.session_key
            queryset = Room.objects.filter(host=host)

            if queryset.exists():
                # if room already exists, update it with new data from the request
                room = queryset[0]
                room.guest_can_pause = guest_can_pause
                room.votes_to_skip = votes_to_skip
                room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
                self.request.session['room_code'] = room.code
            else:
                # else create a new room with the data from the request
                room = Room(host=host, guest_can_pause = guest_can_pause, votes_to_skip=votes_to_skip)

                room.save()
                self.request.session['room_code'] = room.code
            
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)

# fetches a room
class GetRoom(APIView):
    serializer_class = RoomSerializer
    # key by which to filter rooms
    lookup_url_kwarg = 'code'

    def get(self, request, format=None):
        code = request.GET.get(self.lookup_url_kwarg)

        if code != None:
            room = Room.objects.filter(code=code)
            # if room exists, find whether current user is the host and return data,
            # else return error with appropriate status
            if len(room) > 0:
                data = RoomSerializer(room[0]).data
                data['is_host'] = self.request.session.session_key == room[0].host
                return Response(data, status=status.HTTP_200_OK)
            return Response({'Room not found':'Invalid code'}, status=status.HTTP_404_NOT_FOUND)
        
        # do not query if code is not in request
        return Response({'Bad Request':'Code parameter not found'}, status=status.HTTP_400_BAD_REQUEST)

# handles joining a room
class JoinRoom(APIView):
    lookup_url_kwarg = 'code'

    def post(self, request, format=None):
        # check and create session for current user if it does not exist
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()
        
        # get code from the request
        code = request.data.get(self.lookup_url_kwarg)
        if code != None:
            room = Room.objects.filter(code=code)

            # check if room with code exists and join if it does. or else return error response
            if len(room) > 0:
                room = room[0]
                self.request.session['room_code'] = code
                return Response({'message':'Room Joined'}, status=status.HTTP_200_OK)

            return Response({'Bad Request':'Invalid code, room not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({'Bad Request':'Invalid code, room not found'}, status=status.HTTP_400_BAD_REQUEST)

# check if user is in the room
class UserInRoom(APIView):
    def get(self, request, format=None):
        # check and create session for user if it does not already exist
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        # if user has already joined a room in this session, return the code of that room
        data = {
            'code': self.request.session.get('room_code')
        }

        return JsonResponse(data, status=status.HTTP_200_OK)

# leave a room
class LeaveRoom(APIView):
    def post(self, request, format=None):
        if 'room_code' in self.request.session:
            # remove room from session
            self.request.session.pop('room_code')
            # if the user who left the room is also the host, delete the room
            host_id = self.request.session.session_key
            room_results = Room.objects.filter(host=host_id)
            if len(room_results) > 0:
                room = room_results[0]
                room.delete()
        return Response({'message':'Success'}, status=status.HTTP_200_OK)

class UpdateRoom(APIView):
    serializer_class = UpdateRoomSerializer

    def patch(self, request, format=None):
        # check and create session for current user if it does not already exist
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            # extract the data
            guest_can_pause = serializer.data.get('guest_can_pause')
            votes_to_skip = serializer.data.get('votes_to_skip')
            code = serializer.data.get('code')

            queryset = Room.objects.filter(code=code)

            # check whether room exists
            if not queryset.exists():
                return Response({'msg':'Room not found'}, status=status.HTTP_404_NOT_FOUND)

            room = queryset[0]
            user_id = self.request.session.session_key

            # only allow host to update room settings
            if room.host != user_id:
                return Response({'msg':'Only the host can update room settings'}, status=status.HTTP_403_FORBIDDEN)
            
            # update the room and respond with 'OK'
            room.guest_can_pause = guest_can_pause
            room.votes_to_skip = votes_to_skip
            room.save(update_fields=['guest_can_pause', 'votes_to_skip'])
            return Response(RoomSerializer(room).data, status=status.HTTP_200_OK)

        return Response({'Bad Request':'Invalid data'}, status=status.HTTP_400_BAD_REQUEST)



