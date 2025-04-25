# backend/inventory/urls.py
from django.urls import path
from .views import (
    CategoryListCreateAPIView, CategoryDetailAPIView,
    ProductListCreateAPIView, ProductDetailAPIView, LowStockProductsAPIView,
    SaleListCreateAPIView, SaleDetailAPIView
)

urlpatterns = [

    path('categories/', CategoryListCreateAPIView.as_view(), name='category-list-create'),
    path('categories/<int:pk>/', CategoryDetailAPIView.as_view(), name='category-detail'),

    path('products/', ProductListCreateAPIView.as_view(), name='product-list-create'),
    path('products/<int:pk>/', ProductDetailAPIView.as_view(), name='product-detail'),
    path('products/low-stock/', LowStockProductsAPIView.as_view(), name='product-low-stock'),

    path('sales/', SaleListCreateAPIView.as_view(), name='sale-list-create'),
    path('sales/<int:pk>/', SaleDetailAPIView.as_view(), name='sale-detail'),
]