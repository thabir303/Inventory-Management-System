# backend/inventory/serializers.py
from rest_framework import serializers
from .models import Category, Product, Sale

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ('id', 'name', 'description', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class ProductSerializer(serializers.ModelSerializer):

    category_name = serializers.CharField(source='category.name', read_only=True)
    low_stock = serializers.BooleanField(source='is_low_stock', read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'category', 'category_name', 'price', 'quantity',
            'description', 'stock_threshold', 'low_stock', 'sku', 'is_active',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

class SaleSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    sold_by_username = serializers.CharField(source='sold_by.username', read_only=True)

    class Meta:
        model = Sale
        fields = (
            'id', 'product', 'product_name', 'quantity_sold', 'sale_date',
            'sold_by', 'sold_by_username', 'total_price', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'sold_by', 'total_price', 'created_at', 'updated_at')

    def validate(self, data):
        product = data['product']
        quantity_sold = data['quantity_sold']

        if quantity_sold <= 0:
            raise serializers.ValidationError("Quantity sold must be greater than zero.")

        if quantity_sold > product.quantity:
            raise serializers.ValidationError(f"Cannot sell {quantity_sold} units of {product.name}. Only {product.quantity} available in stock.")

        return data

    def create(self, validated_data):
        product = validated_data['product']
        quantity_sold = validated_data['quantity_sold']
        
        validated_data['total_price'] = product.price * quantity_sold

        sale = Sale.objects.create(**validated_data)
        
        return sale