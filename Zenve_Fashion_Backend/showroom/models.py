from django.db import models

class ShowroomAppointment(models.Model):
    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    preferred_date = models.CharField(max_length=50)
    preferred_time = models.CharField(max_length=50)
    guest_count = models.IntegerField(default=1)
    pet_name = models.CharField(max_length=100, blank=True, null=True)
    pet_breed = models.CharField(max_length=100, blank=True, null=True)
    service_interest = models.CharField(max_length=100, default="private_walkthrough")
    message = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=50, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "showroom_appointments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} - {self.preferred_date} {self.preferred_time}"
