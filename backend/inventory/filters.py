# backend/inventory/filters.py
import django_filters
from django.db.models import F, Q
from .models import Product

class ProductFilter(django_filters.FilterSet):
    
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    min_quantity = django_filters.NumberFilter(field_name="quantity", lookup_expr='gte')
    max_quantity = django_filters.NumberFilter(field_name="quantity", lookup_expr='lte')
    low_stock = django_filters.BooleanFilter(method='filter_low_stock')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Product
        fields = ['category', 'is_active']

    def filter_low_stock(self, queryset, name, value):
        if value:
            return queryset.filter(quantity__lte=F('stock_threshold'))
        return queryset
    
    def filter_search(self, queryset, name, value):
        if value:
            return queryset.filter(
                Q(name__icontains=value) | 
                Q(description__icontains=value) |
                Q(sku__icontains=value) |
                Q(category__name__icontains=value)
            )
        return queryset