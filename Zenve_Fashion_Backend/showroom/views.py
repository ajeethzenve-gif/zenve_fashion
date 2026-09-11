from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .models import ShowroomAppointment
from .serializers import ShowroomAppointmentSerializer

class AppointmentListCreateAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        appointments = ShowroomAppointment.objects.all()
        serializer = ShowroomAppointmentSerializer(appointments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ShowroomAppointmentSerializer(data=request.data)
        if serializer.is_valid():
            appointment = serializer.save()
            return Response(ShowroomAppointmentSerializer(appointment).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
