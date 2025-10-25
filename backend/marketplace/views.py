from rest_framework import viewsets, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from .models import (
    Seller,
    Product,
    Order,
    OrderItem,
    Payment,
    User,
    SellerUser,
    SellerInvitation,
)
from .serializers import (
    SellerSerializer,
    ProductSerializer,
    OrderSerializer,
    PaymentSerializer,
    UserSerializer,
    SellerInvitationSerializer,
)
from .permissions import IsSellerOrReadOnly


def _get_user_seller_memberships(user):
    return SellerUser.objects.filter(user=user).select_related("seller")

class SellerViewSet(viewsets.ModelViewSet):
    queryset = Seller.objects.all()
    serializer_class = SellerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("ops_admin",):
            return Seller.objects.all().select_related("user").prefetch_related("members__user")
        if user.role in ("seller_admin", "seller_staff"):
            seller_ids = _get_user_seller_memberships(user).values_list("seller_id", flat=True)
            return (
                Seller.objects.filter(id__in=seller_ids)
                .select_related("user")
                .prefetch_related("members__user")
            )
        return Seller.objects.filter(user=user).select_related("user").prefetch_related("members__user")

    def perform_create(self, serializer):
        seller = serializer.save(user=self.request.user)
        SellerUser.objects.get_or_create(
            seller=seller,
            user=self.request.user,
            defaults={"role": SellerUser.ROLE_ADMIN},
        )

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("-created_at")
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrReadOnly]
    filterset_fields = ["category","seller"]
    search_fields = ["name","brand","category"]
    ordering_fields = ["price","created_at"]

    def perform_create(self, serializer):
        membership = _get_user_seller_memberships(self.request.user).first()
        if not membership:
            raise ValidationError("Seller profile not found for user")
        serializer.save(seller=membership.seller)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        if u.role in ("seller_admin","seller_staff"):
            seller_ids = _get_user_seller_memberships(u).values_list("seller_id", flat=True)
            return Order.objects.filter(seller_id__in=seller_ids)
        return Order.objects.filter(buyer=u)

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def add_item(self, request, pk=None):
        order = self.get_object()
        product_id = request.data["product_id"]
        qty = int(request.data["quantity"])
        from .models import Product, OrderItem
        product = Product.objects.get(id=product_id)
        line_total = qty * product.price
        OrderItem.objects.create(order=order, product=product, quantity=qty,
                                 unit_price=product.price, line_total=line_total)
        # recompute totals
        items = order.items.all()
        subtotal = sum([i.line_total for i in items])
        order.subtotal = subtotal
        order.tax = 0
        order.total = subtotal
        order.save()
        return Response(OrderSerializer(order).data)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by("-created_at")
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]


class SellerInvitationViewSet(viewsets.ModelViewSet):
    serializer_class = SellerInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ("ops_admin",):
            return SellerInvitation.objects.all().select_related("seller", "invited_by")
        seller_ids = _get_user_seller_memberships(user).values_list("seller_id", flat=True)
        return (
            SellerInvitation.objects.filter(seller_id__in=seller_ids)
            .select_related("seller", "invited_by")
        )

    def perform_create(self, serializer):
        membership = (
            _get_user_seller_memberships(self.request.user)
            .filter(role=SellerUser.ROLE_ADMIN)
            .first()
        )
        if not membership:
            raise ValidationError("Only seller admins can invite team members.")
        if SellerInvitation.objects.filter(
            seller=membership.seller,
            email=serializer.validated_data.get("email"),
            status=SellerInvitation.STATUS_PENDING,
        ).exists():
            raise ValidationError("An invitation has already been sent to that email.")
        if SellerInvitation.objects.filter(
            seller=membership.seller,
            phone=serializer.validated_data.get("phone"),
            status=SellerInvitation.STATUS_PENDING,
        ).exists():
            raise ValidationError("An invitation has already been sent to that phone number.")
        serializer.save(
            seller=membership.seller,
            invited_by=self.request.user,
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        invitation = self.get_object()
        if invitation.status != SellerInvitation.STATUS_PENDING:
            return Response(
                {"detail": "Invitation is not pending."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        invitation.status = SellerInvitation.STATUS_CANCELLED
        invitation.save(update_fields=["status"])
        return Response({"ok": True})

    @action(
        detail=False,
        methods=["get"],
        permission_classes=[permissions.AllowAny],
        url_path="lookup",
    )
    def lookup(self, request):
        token = request.query_params.get("token")
        if not token:
            return Response(
                {"detail": "Token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            invitation = SellerInvitation.objects.select_related("seller").get(
                token=token,
                status=SellerInvitation.STATUS_PENDING,
            )
        except SellerInvitation.DoesNotExist:
            return Response(
                {"detail": "Invitation not found or already used."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = SellerInvitationSerializer(invitation)
        return Response(serializer.data)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[permissions.AllowAny],
        url_path="accept",
    )
    @transaction.atomic
    def accept(self, request):
        token = request.data.get("token")
        full_name = request.data.get("full_name")
        password = request.data.get("password")
        if not all([token, full_name, password]):
            return Response(
                {"detail": "Token, full_name, and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            invitation = SellerInvitation.objects.select_related("seller").get(
                token=token,
                status=SellerInvitation.STATUS_PENDING,
            )
        except SellerInvitation.DoesNotExist:
            return Response(
                {"detail": "Invitation not found or already used."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if User.objects.filter(phone=invitation.phone).exists():
            return Response(
                {
                    "detail": "An account with that phone already exists. Please contact support to link it manually.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            phone=invitation.phone,
            password=password,
            full_name=full_name,
            role="seller_staff",
        )
        if invitation.email and not User.objects.filter(email=invitation.email).exists():
            user.email = invitation.email
            user.save(update_fields=["email"])

        SellerUser.objects.create(
            seller=invitation.seller,
            user=user,
            role=SellerUser.ROLE_STAFF,
            invited_by=invitation.invited_by,
        )

        invitation.status = SellerInvitation.STATUS_ACCEPTED
        invitation.accepted_at = timezone.now()
        invitation.save(update_fields=["status", "accepted_at"])

        from .auth_views import tokens_for_user

        tokens = tokens_for_user(user)
        return Response({"user": UserSerializer(user).data, "tokens": tokens})

@api_view(["POST"])
@permission_classes([permissions.AllowAny])  # PSP will call this
def payment_webhook(request):
    """
    Expect payload with tx_ref, status, amount, provider.
    Verify signature if PSP provides one, then update Payment & Order.
    """
    data = request.data
    tx_ref = data.get("tx_ref")
    status_str = data.get("status","failed").lower()
    try:
        payment = Payment.objects.get(tx_ref=tx_ref)
        payment.status = "success" if status_str == "success" else "failed"
        payment.payload = data
        payment.save()
        # mark order
        if payment.status == "success":
            order = payment.order
            order.status = "confirmed"
            order.save()
        return Response({"ok": True})
    except Payment.DoesNotExist:
        return Response({"ok": False, "error": "Payment not found"}, status=404)
