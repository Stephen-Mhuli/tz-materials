from celery import shared_task
from django.utils import timezone
from .models import Payment

@shared_task
def reconcile_payments():
    # TODO: call PSP/operators to confirm settlement vs internal records
    pending = Payment.objects.filter(status="pending", created_at__lt=timezone.now())
    return pending.count()
