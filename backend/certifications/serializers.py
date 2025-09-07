from rest_framework.serializers import Serializer, ModelSerializer, CharField

from .models import Certification


class CertificationSerializer(ModelSerializer):
    course = CharField(source='enrollment.course.title')
    
    class Meta:
        model = Certification
        fields = [
            "id",
            "course",
            "issued_at",
            "certificate_file"
        ]