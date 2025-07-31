from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from assessments.models import TestAssessmentCategoryDescription

from .models import Category
from .serializers import CategorySerializer


class CategoryList(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CategorySerializer


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CategorySerializer


class CategoryTestAssessmentDescription(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        category_id = kwargs.get("pk")
        try:
            test_assessment_category_description = (
                TestAssessmentCategoryDescription.objects.get(id=category_id)
            )
            return Response(test_assessment_category_description.text)
        except Exception as e:
            print(e)
            return Response({"error": "Internal server error"}, status=500)
