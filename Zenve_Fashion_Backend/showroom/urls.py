from django.urls import path
from .views import AppointmentListCreateAPIView

urlpatterns = [
    path("appointments", AppointmentListCreateAPIView.as_view(), name="showroom-appointments-no-slash"),
    path("appointments/", AppointmentListCreateAPIView.as_view(), name="showroom-appointments"),
]
