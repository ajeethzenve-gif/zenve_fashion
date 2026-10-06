from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


def ensure_columns(apps, schema_editor):
    # Some installations recorded 0002 without applying its table changes.
    # Add missing columns only; retain existing customer items and legacy columns.
    for name in ["Cart", "CartItem"]:
        model = apps.get_model("cart", name)
        with schema_editor.connection.cursor() as cursor:
            columns = {c.name for c in schema_editor.connection.introspection.get_table_description(cursor, model._meta.db_table)}
        for field in model._meta.local_fields:
            if field.column not in columns:
                schema_editor.add_field(model, field)
                columns.add(field.column)


class Migration(migrations.Migration):
    atomic = False
    dependencies = [("cart", "0002_cart_alter_cartitem_options_and_more")]
    operations = [migrations.SeparateDatabaseAndState(
        state_operations=[
            migrations.AlterUniqueTogether(name="cartitem", unique_together=set()),
            migrations.RemoveField(model_name="cartitem", name="cart"),
            migrations.AddField(model_name="cartitem", name="user", field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to="auth.user")),
            migrations.AddField(model_name="cartitem", name="product_name", field=models.CharField(max_length=255, default="")),
            migrations.AddField(model_name="cartitem", name="product_image", field=models.URLField(blank=True, default="")),
            migrations.AddField(model_name="cartitem", name="price", field=models.DecimalField(max_digits=12, decimal_places=2, default=0)),
            migrations.AddField(model_name="cartitem", name="created_at", field=models.DateTimeField(default=timezone.now)),
            migrations.AddField(model_name="cartitem", name="updated_at", field=models.DateTimeField(default=timezone.now)),
            migrations.AddField(model_name="cartitem", name="size", field=models.CharField(max_length=50, default="Standard")),
            migrations.AddField(model_name="cartitem", name="color", field=models.CharField(max_length=100, default="Standard")),
            migrations.AddField(model_name="cartitem", name="color_hex", field=models.CharField(max_length=20, default="#E4BD5A")),
            migrations.AlterField(model_name="cart", name="customer", field=models.OneToOneField(null=True, blank=True, on_delete=django.db.models.deletion.CASCADE, related_name="cart", to="accounts.customer")),
        ],
        database_operations=[],
    ), migrations.RunPython(ensure_columns, migrations.RunPython.noop, atomic=False)]
