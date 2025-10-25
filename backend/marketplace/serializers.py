from rest_framework import serializers
from .models import (
    User,
    Seller,
    Product,
    Order,
    OrderItem,
    Payment,
    SellerUser,
    SellerInvitation,
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id","full_name","phone","email","role","kyc_status")

class SellerMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = SellerUser
        fields = ("id", "user", "role", "created_at")
        read_only_fields = fields


class SellerSerializer(serializers.ModelSerializer):
    members = SellerMemberSerializer(many=True, read_only=True)

    class Meta:
        model = Seller
        fields = (
            "id",
            "user",
            "business_name",
            "tin",
            "phone",
            "email",
            "verified",
            "pickup_location",
            "address",
            "created_at",
            "updated_at",
            "members",
        )
        read_only_fields = ("id","user","created_at","updated_at","members")

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"
        read_only_fields = ("id","seller","created_at","updated_at")

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = "__all__"

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = "__all__"
        read_only_fields = ("id","buyer","subtotal","tax","shipping_fee","total","created_at","updated_at")

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"


class SellerInvitationSerializer(serializers.ModelSerializer):
    seller_name = serializers.CharField(source="seller.business_name", read_only=True)

    class Meta:
        model = SellerInvitation
        fields = (
            "id",
            "email",
            "phone",
            "role",
            "status",
            "token",
            "seller",
            "seller_name",
            "created_at",
            "accepted_at",
        )
        read_only_fields = (
            "id",
            "status",
            "token",
            "seller",
            "seller_name",
            "created_at",
            "accepted_at",
        )
