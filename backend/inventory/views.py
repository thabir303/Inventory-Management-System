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
    
    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return Response({
            'success': True,
            'message': 'Categories retrieved successfully',
            'data': response.data,
            'count': len(response.data)
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                'success': True,
                'message': 'Category created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Failed to create category',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method != 'GET':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'message': 'Category retrieved successfully',
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({
                'success': True,
                'message': 'Category updated successfully',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'message': 'Failed to update category',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Category deleted successfully'
        }, status=status.HTTP_200_OK)

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
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'message': 'Products retrieved successfully',
                'data': response.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'message': 'Products retrieved successfully',
            'data': serializer.data,
            'count': len(serializer.data)
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                'success': True,
                'message': 'Product created successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Failed to create product',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ProductDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method != 'GET':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'message': 'Product retrieved successfully',
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({
                'success': True,
                'message': 'Product updated successfully',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'message': 'Failed to update product',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Product deleted successfully'
        }, status=status.HTTP_200_OK)

class LowStockProductsAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        from django.db.models import F
        return Product.objects.filter(quantity__lte=F('stock_threshold'))
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'message': 'Low stock products retrieved successfully',
            'data': serializer.data,
            'count': len(serializer.data)
        })

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
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            return Response({
                'success': True,
                'message': 'Sales retrieved successfully',
                'data': response.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'success': True,
            'message': 'Sales retrieved successfully',
            'data': serializer.data,
            'count': len(serializer.data)
        })
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({
                'success': True,
                'message': 'Sale recorded successfully',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'message': 'Failed to record sale',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

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
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'message': 'Sale retrieved successfully',
            'data': serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            self.perform_update(serializer)
            return Response({
                'success': True,
                'message': 'Sale updated successfully',
                'data': serializer.data
            })
        return Response({
            'success': False,
            'message': 'Failed to update sale',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Sale deleted successfully'
        }, status=status.HTTP_200_OK)