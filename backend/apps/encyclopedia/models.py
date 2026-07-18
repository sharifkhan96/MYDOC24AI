from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class DiseaseEntry(TimeStampedModel):
    class Category(models.TextChoices):
        CLINICAL = "clinical", "Clinical"
        WELLBEING = "wellbeing", "Wellbeing & beauty"

    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    category = models.CharField(max_length=15, choices=Category.choices, default=Category.CLINICAL)
    overview = models.TextField()
    history = models.TextField(blank=True)
    severity_mortality_context = models.TextField(blank=True)
    treatment_evolution = models.TextField(blank=True)
    current_outlook = models.TextField(blank=True)
    sources = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "disease entries"

    def __str__(self):
        return self.name


class RoleModelQuery(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="role_model_queries")
    name = models.CharField(max_length=150)
    content = models.JSONField(default=dict, blank=True)
    ai_provider_used = models.CharField(max_length=30, blank=True)
    is_mock = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} role model query: {self.name}"


class WellbeingRecommendationQuery(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wellbeing_recommendation_queries")
    goal = models.CharField(max_length=200)
    content = models.JSONField(default=dict, blank=True)
    ai_provider_used = models.CharField(max_length=30, blank=True)
    is_mock = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} wellbeing goal: {self.goal}"
