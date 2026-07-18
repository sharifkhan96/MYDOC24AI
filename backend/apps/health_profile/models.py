from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class HealthProfile(TimeStampedModel):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="health_profile")
    height_cm = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=1, null=True, blank=True)
    blood_type = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"Health profile for {self.user.email}"


class Condition(TimeStampedModel):
    class Status(models.TextChoices):
        PAST = "past", "Past"
        ONGOING = "ongoing", "Ongoing"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="conditions")
    name = models.CharField(max_length=200)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.ONGOING)
    diagnosed_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} ({self.status})"


class Allergy(TimeStampedModel):
    class Severity(models.TextChoices):
        MILD = "mild", "Mild"
        MODERATE = "moderate", "Moderate"
        SEVERE = "severe", "Severe"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="allergies")
    allergen = models.CharField(max_length=200)
    reaction = models.CharField(max_length=300, blank=True)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MILD)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "allergies"

    def __str__(self):
        return self.allergen


class Medication(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="medications")
    name = models.CharField(max_length=200)
    dosage = models.CharField(max_length=200, blank=True)
    frequency = models.CharField(max_length=200, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class FamilyHistoryEntry(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="family_history")
    relation = models.CharField(max_length=100)
    condition = models.CharField(max_length=200)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "family history entries"

    def __str__(self):
        return f"{self.relation}: {self.condition}"
