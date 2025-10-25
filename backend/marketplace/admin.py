from django.contrib import admin
from .models import User, Seller, Product, Order, OrderItem, Payment, Invoice
admin.site.register([User, Seller, Product, Order, OrderItem, Payment, Invoice])
