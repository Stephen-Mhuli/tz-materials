from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken

def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    full_name = request.data.get("full_name")
    phone = request.data.get("phone")
    password = request.data.get("password")
    role = request.data.get("role","buyer")
    if role == "seller":
        role = "seller_admin"
    if role not in ("buyer", "seller_admin"):
        role = "buyer"
    if not all([full_name, phone, password]):
        return Response({"detail":"Missing fields"}, status=400)
    if User.objects.filter(phone=phone).exists():
        return Response({"detail":"Phone already registered"}, status=400)
    user = User.objects.create_user(phone=phone, password=password, full_name=full_name, role=role)
    return Response({"user": UserSerializer(user).data, "tokens": tokens_for_user(user)}, status=201)

@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    phone = request.data.get("phone")
    password = request.data.get("password")
    user = authenticate(request, phone=phone, password=password)
    if not user:
        # manual fallback
        try:
            from .models import User
            user_obj = User.objects.get(phone=phone)
            if not user_obj.check_password(password):
                raise Exception()
            user = user_obj
        except Exception:
            return Response({"detail":"Invalid credentials"}, status=400)
    return Response({"user": UserSerializer(user).data, "tokens": tokens_for_user(user)})
