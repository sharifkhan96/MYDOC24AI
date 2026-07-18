from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel


class Bulletin(TimeStampedModel):
    class Severity(models.TextChoices):
        LOW = "low", "Low"
        MODERATE = "moderate", "Moderate"
        HIGH = "high", "High"

    title = models.CharField(max_length=200)
    region = models.CharField(max_length=100, blank=True)
    summary = models.TextField()
    body = models.TextField()
    severity_level = models.CharField(max_length=10, choices=Severity.choices, default=Severity.LOW)
    source_links = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=True)
    published_at = models.DateTimeField()

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return self.title


class TravelAdvisoryQuery(TimeStampedModel):
    class DestinationType(models.TextChoices):
        COLD = "cold", "Cold or snowy"
        HOT_DESERT = "hot_desert", "Hot or desert"
        BEACH_TROPICAL = "beach_tropical", "Beach or tropical"
        CRUISE = "cruise", "Cruise"
        FOREST_JUNGLE = "forest_jungle", "Forest or jungle"
        HIGH_ALTITUDE = "high_altitude", "Mountain or high-altitude"
        URBAN_CITY = "urban_city", "Urban or city"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="travel_advisory_queries")
    destination_type = models.CharField(max_length=20, choices=DestinationType.choices)
    destination_name = models.CharField(max_length=150, blank=True)
    advice = models.TextField(blank=True)
    ai_provider_used = models.CharField(max_length=30, blank=True)
    is_mock = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} travel advisory for {self.get_destination_type_display()}"
