import uuid
from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra):
        if not phone:
            raise ValueError("Phone required")
        user = self.model(phone=phone, **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user
    def create_superuser(self, phone, password, **extra):
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self.create_user(phone, password, **extra)

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [('buyer','Buyer'),('seller_admin','Seller Admin'),('seller_staff','Seller Staff'),('ops_admin','Ops Admin')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, unique=True)
    email = models.EmailField(null=True, blank=True, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='buyer')
    kyc_status = models.CharField(max_length=20, default='pending')
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    USERNAME_FIELD = "phone"
    objects = UserManager()
    def __str__(self): return f"{self.full_name} ({self.phone})"

class Seller(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=150)
    tin = models.CharField(max_length=30, blank=True, null=True)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    verified = models.BooleanField(default=False)
    pickup_location = models.PointField(geography=True, null=True, blank=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.business_name

class SellerUser(models.Model):
    ROLE_ADMIN = "admin"
    ROLE_STAFF = "staff"
    ROLE_CHOICES = [
        (ROLE_ADMIN, "Admin"),
        (ROLE_STAFF, "Staff"),
    ]

    seller = models.ForeignKey(Seller, related_name="members", on_delete=models.CASCADE)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="seller_memberships",
        on_delete=models.CASCADE,
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=ROLE_STAFF)
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="seller_invited_members",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("seller", "user")

    def __str__(self):
        return f"{self.user.full_name} → {self.seller.business_name} ({self.role})"


class SellerInvitation(models.Model):
    STATUS_PENDING = "pending"
    STATUS_ACCEPTED = "accepted"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_ACCEPTED, "Accepted"),
        (STATUS_CANCELLED, "Cancelled"),
    ]

    seller = models.ForeignKey(Seller, related_name="invitations", on_delete=models.CASCADE)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    role = models.CharField(
        max_length=10,
        choices=SellerUser.ROLE_CHOICES,
        default=SellerUser.ROLE_STAFF,
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="sent_seller_invitations",
        on_delete=models.CASCADE,
    )
    status = models.CharField(
        max_length=12,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Invite {self.email} to {self.seller.business_name} ({self.status})"

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE)
    category = models.CharField(max_length=100)
    name = models.CharField(max_length=150)
    brand = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    unit = models.CharField(max_length=30)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    stock = models.PositiveIntegerField(default=0)
    images = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

class Order(models.Model):
    STATUS = [('pending','Pending'),('confirmed','Confirmed'),('dispatched','Dispatched'),('delivered','Delivered'),('cancelled','Cancelled')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    seller = models.ForeignKey(Seller, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    tax = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    shipping_fee = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, null=True)
    delivery_method = models.CharField(max_length=30, default='pickup')
    delivery_address = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

class OrderItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

class Payment(models.Model):
    STATUS = [('pending','Pending'),('success','Success'),('failed','Failed')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    method = models.CharField(max_length=20)      # mobile_money
    provider = models.CharField(max_length=30, blank=True, null=True)  # mpesa/tigo/airtel
    tx_ref = models.CharField(max_length=100, blank=True, null=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS, default='pending')
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    invoice_no = models.CharField(max_length=50, unique=True)
    fiscal_status = models.CharField(max_length=20, default='pending')
    tra_token = models.TextField(blank=True, null=True)
    pdf_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
