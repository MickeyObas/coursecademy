from rest_framework.generics import ListAPIView, RetrieveAPIView

from core.permissions import IsStudent

from .models import Certification
from .serializers import CertificationSerializer


class CertificationListView(ListAPIView):
    permission_classes = [IsStudent]
    serializer_class = CertificationSerializer

    def get_queryset(self):
        return Certification.objects.filter(enrollment__user=self.request.user)
