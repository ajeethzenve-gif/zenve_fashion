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

    def to_internal_value(self, data):
        d = data.copy() if hasattr(data, "copy") else dict(data)
        if "mobile" in d and "phone" not in d:
            d["phone"] = d["mobile"]
        if "date" in d and "preferredDate" not in d:
            d["preferredDate"] = d["date"]
        if "timeSlot" in d and "preferredTime" not in d:
            d["preferredTime"] = d["timeSlot"]
        if "guests" in d and "guestCount" not in d:
            d["guestCount"] = d["guests"]
        if "experience" in d and "serviceInterest" not in d:
            d["serviceInterest"] = d["experience"]
        if "notes" in d and "message" not in d:
            d["message"] = d["notes"]
        return super().to_internal_value(d)

