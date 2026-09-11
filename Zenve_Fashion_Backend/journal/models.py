from django.db import models

class Article(models.Model):
    slug = models.SlugField(max_length=255, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=100)
    read_time = models.CharField(max_length=50, default="4 min read")
    description = models.TextField(blank=True, default="")
    content = models.JSONField(default=list)
    image = models.CharField(max_length=500, blank=True, default="")
    author = models.CharField(max_length=150, default="Zenve Editorial")
    published_at = models.CharField(max_length=100, default="")
    tags = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "journal_articles"
        ordering = ["-id"]

    def __str__(self):
        return self.title
