from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from  .models import Enrollment
from .serializers import EnrollmentSerializer


class EnrollmentListCreate(generics.ListCreateAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class EnrollmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserEnrollmentList(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, user_id):
        if request.user.id != user_id and not request.user.is_staff:
            return Response({
                'error': 'You are not authorized to view these enrollments'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user_enrollments = Enrollment.objects.filter(user=request.user)
        serializer = EnrollmentSerializer(user_enrollments, many=True)

        return Response(serializer.data)