# backend/inventory/views.py
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import Category, Product, Sale
from .serializers import CategorySerializer, ProductSerializer, SaleSerializer
from .filters import ProductFilter
from user_module.permissions import IsAdminUser

class CategoryListCreateAPIView(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):

        if self.request.method != 'GET':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

class CategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):

        if self.request.method != 'GET':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

class ProductListCreateAPIView(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'sku', 'category__name']
    
    def get_permissions(self):
        if self.request.method != 'GET':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method != 'GET':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

class LowStockProductsAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from django.db.models import F
        return Product.objects.filter(quantity__lte=F('stock_threshold'))

class SaleListCreateAPIView(generics.ListCreateAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['product', 'sold_by']
    search_fields = ['product__name']
    
    def perform_create(self, serializer):
        sale = serializer.save(sold_by=self.request.user)
        
        product = sale.product
        product.quantity -= sale.quantity_sold
        product.save()

class SaleDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    permission_classes = [IsAdminUser]
    
    def perform_update(self, serializer):
        sale = self.get_object()
        old_quantity = sale.quantity_sold
        
        updated_sale = serializer.save()
        
        product = updated_sale.product
        quantity_difference = updated_sale.quantity_sold - old_quantity
        product.quantity -= quantity_difference
        product.save()
    
    def perform_destroy(self, instance):
        product = instance.product
        product.quantity += instance.quantity_sold
        product.save()
        
        instance.delete()