from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from marketplace.views import (
    SellerViewSet,
    ProductViewSet,
    OrderViewSet,
    PaymentViewSet,
    SellerInvitationViewSet,
    payment_webhook,
)
from marketplace.auth_views import register, login
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r"sellers", SellerViewSet, basename="seller")
router.register(r"products", ProductViewSet, basename="product")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"payments", PaymentViewSet, basename="payment")
router.register(r"seller-invitations", SellerInvitationViewSet, basename="seller-invitation")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/register/", register),
    path("api/auth/login/", login),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("api/webhooks/payments/", payment_webhook, name="payment-webhook"),
    path("api/", include(router.urls)),
]
