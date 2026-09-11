from rest_framework import serializers
from .models import ShowroomAppointment

class ShowroomAppointmentSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name")
    preferredDate = serializers.CharField(source="preferred_date")
    preferredTime = serializers.CharField(source="preferred_time")
    guestCount = serializers.IntegerField(source="guest_count")
    petName = serializers.CharField(source="pet_name", required=False, allow_null=True, allow_blank=True)
    petBreed = serializers.CharField(source="pet_breed", required=False, allow_null=True, allow_blank=True)
    serviceInterest = serializers.CharField(source="service_interest")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    id = serializers.SerializerMethodField()

    class Meta:
        model = ShowroomAppointment
        fields = [
            "id",
            "fullName",
            "email",
            "phone",
            "preferredDate",
            "preferredTime",
            "guestCount",
            "petName",
            "petBreed",
            "serviceInterest",
            "message",
            "status",
            "createdAt",
        ]

    def get_id(self, obj):
        return str(obj.id)
