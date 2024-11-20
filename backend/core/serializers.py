from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers

class CustomRegisterSerializer(RegisterSerializer):
    gender = serializers.CharField(required=False)
    age = serializers.IntegerField(required=False)
    location = serializers.CharField(required=False)

    def save(self, request):
        user = super().save(request)
        user.gender = self.data.get('gender')
        user.age = self.data.get('age')
        user.location = self.data.get('location')
        user.save()
        return user