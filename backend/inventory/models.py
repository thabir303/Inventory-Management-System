# backend/inventory/models.py
from django.db import models
from django.core.exceptions import ValidationError
from django.conf import settings


class BaseModel(models.Model):

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Category(BaseModel):

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

class Product(BaseModel):

    name = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    stock_threshold = models.PositiveIntegerField(default=5)
    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    def is_low_stock(self):
        return self.quantity <= self.stock_threshold

    class Meta:
        ordering = ['name']


class Sale(BaseModel):

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='sales')
    quantity_sold = models.PositiveIntegerField()
    sale_date = models.DateTimeField(auto_now_add=True)
    sold_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='sales')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} - {self.quantity_sold} units sold on {self.sale_date.strftime('%Y-%m-%d')}"

    def clean(self):
        if self.quantity_sold > self.product.quantity:
            raise ValidationError(f"Cannot sell {self.quantity_sold} units. Only {self.product.quantity} available in stock.")

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.product.price * self.quantity_sold

        self.product.quantity -= self.quantity_sold
        self.product.save()

        super().save(*args, **kwargs)