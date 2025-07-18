from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from  .models import Enrollment
from .serializers import EnrollmentSerializer


class EnrollmentListCreate(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]