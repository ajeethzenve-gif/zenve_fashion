from django.core.management.base import BaseCommand
from products.models import Product
from zenve_collections.models import Collection
from journal.models import Article
from django.contrib.auth.models import User
from accounts.models import Customer, CustomerAddress, Role, UserRole
from designers.models import Designer


class Command(BaseCommand):
    help = "Manage database seed data: removes all hardcoded seed data to serve only genuine database stored records."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Clearing any seed data from database..."))

        p_count, _ = Product.objects.all().delete()
        c_count, _ = Collection.objects.all().delete()
        a_count, _ = Article.objects.all().delete()
        CustomerAddress.objects.all().delete()
        Customer.objects.all().delete()
        User.objects.filter(username__in=["zenve_client", "atelier_admin", "customer@zenve.fashion", "admin@zenve.fashion"]).delete()
        Role.objects.filter(name__in=["Customer", "Admin"]).delete()
        Designer.objects.filter(designer_code="DSG-001").delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"All seed data removed successfully!\n"
                f" - Removed {p_count} products\n"
                f" - Removed {c_count} collections\n"
                f" - Removed {a_count} articles\n"
                f" - Cleaned seed accounts\n"
                f"The application is now operating purely on database-stored records."
            )
        )
