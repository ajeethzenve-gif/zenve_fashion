from django.db import models

class Collection(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    description = models.TextField(blank=True, default="")
    image = models.CharField(max_length=500, blank=True, default="")
    category = models.CharField(max_length=50, default="all")  # 'people' | 'pets' | 'twin' | 'all'
    item_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "collections"
        ordering = ["id"]

    def __str__(self):
        return self.name
