import pytest
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

@pytest.mark.django_db
class TestHealthCheck:
    def test_health_check(self):
        client = APIClient()
        url = reverse('health-check')
        response = client.get(url, secure=True)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"status": "healthy"} 