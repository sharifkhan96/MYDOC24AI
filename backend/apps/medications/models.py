from django.db import models

from apps.core.models import TimeStampedModel


class MedicationReference(TimeStampedModel):
    name = models.CharField(max_length=200)
    generic_name = models.CharField(max_length=200, blank=True)
    drug_class = models.CharField(max_length=200, blank=True)
    adult_dosing = models.TextField(blank=True)
    pediatric_dosing = models.TextField(blank=True)
    how_to_take = models.TextField(blank=True)
    food_alcohol_interactions = models.TextField(blank=True)
    common_side_effects = models.TextField(blank=True)
    serious_side_effects = models.TextField(blank=True)
    missed_dose_guidance = models.TextField(blank=True)
    interaction_warnings = models.JSONField(default=list, blank=True)
    is_seeded = models.BooleanField(default=False)
    generated_as_mock = models.BooleanField(
        default=False,
        help_text="True if this entry's content was produced by a mock AI provider (no key configured) rather than a real model.",
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
