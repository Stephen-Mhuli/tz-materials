from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from marketplace.models import Seller, Product, SellerUser
from django.contrib.gis.geos import Point

User = get_user_model()

class Command(BaseCommand):
    help = "Seed demo users, sellers, and products"

    def handle(self, *args, **kwargs):
        buyer, _ = User.objects.get_or_create(
            phone="255700000001",
            defaults={"full_name":"Demo Buyer","password":"pass123","role":"buyer"},
        )
        seller_user, _ = User.objects.get_or_create(
            phone="255700000002",
            defaults={"full_name":"Demo Seller","password":"pass123","role":"seller_admin"},
        )
        seller, _ = Seller.objects.get_or_create(
            user=seller_user,
            defaults={
                "business_name":"Demo Hardware",
                "phone":"255700000002",
                "pickup_location":Point(39.276,-6.817),  # Dar es Salaam coords
            }
        )
        SellerUser.objects.get_or_create(
            seller=seller,
            user=seller_user,
            defaults={"role": SellerUser.ROLE_ADMIN},
        )
        demo_products = [
            {
                "name": "Cement Bag 50kg",
                "category": "cement",
                "unit": "bag",
                "price": 19000,
                "stock": 200,
                "brand": "Twiga Cement",
                "description": "Portland cement suitable for structural works, supplied in moisture-proof bags.",
                "images": [
                    "https://images.unsplash.com/photo-1582719478250-8a06aa17427a?auto=format&fit=crop&w=1200&q=80",
                ],
            },
            {
                "name": "Iron Sheet (Gauge 30)",
                "category": "steel",
                "unit": "piece",
                "price": 25000,
                "stock": 80,
                "brand": "ALAF",
                "description": "Zinc-coated roofing sheets, 30 gauge, cut-to-length with anti-rust protection.",
                "images": [
                    "https://images.unsplash.com/photo-1517586979033-e4fc5edfc3b1?auto=format&fit=crop&w=1200&q=80",
                ],
            },
            {
                "name": "Reinforcement Bar Y12",
                "category": "rebar",
                "unit": "length",
                "price": 14500,
                "stock": 450,
                "brand": "Kiboko Steel",
                "description": "High tensile reinforcement bar, Y12 standard length, heat-number traceability available.",
                "images": [
                    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=1200&q=80",
                ],
            },
            {
                "name": "Washed River Sand",
                "category": "aggregates",
                "unit": "tonne",
                "price": 35000,
                "stock": 120,
                "brand": "LMGa Quarry",
                "description": "Clean river sand suitable for plastering and block works. Delivered with moisture control.",
                "images": [
                    "https://images.unsplash.com/photo-1581847948721-5a9b93d107c4?auto=format&fit=crop&w=1200&q=80",
                ],
            },
            {
                "name": "Concrete Vibrator Hire",
                "category": "equipment",
                "unit": "day",
                "price": 55000,
                "stock": 15,
                "brand": "Bosch Professional",
                "description": "High-frequency concrete vibrators supplied with certified operators for in-situ pours.",
                "images": [
                    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80",
                ],
            },
            {
                "name": "Gypsum Ceiling Boards",
                "category": "finishes",
                "unit": "sheet",
                "price": 22000,
                "stock": 300,
                "brand": "Gyproc",
                "description": "12mm fire-rated gypsum boards with taped edges, ideal for commercial interiors.",
                "images": [
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
                ],
            },
        ]

        for product_data in demo_products:
            Product.objects.update_or_create(
                seller=seller,
                name=product_data["name"],
                defaults={
                    "category": product_data["category"],
                    "unit": product_data["unit"],
                    "price": product_data["price"],
                    "stock": product_data["stock"],
                    "brand": product_data.get("brand"),
                    "description": product_data.get("description"),
                    "images": product_data.get("images", []),
                },
            )
        self.stdout.write(self.style.SUCCESS("Demo data seeded successfully"))
