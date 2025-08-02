from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

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

