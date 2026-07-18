from django.urls import path

from .views import MedicationDetailView, MedicationLookupView, MedicationSearchView

urlpatterns = [
    path("search/", MedicationSearchView.as_view(), name="medication-search"),
    path("lookup/", MedicationLookupView.as_view(), name="medication-lookup"),
    path("<int:pk>/", MedicationDetailView.as_view(), name="medication-detail"),
]
