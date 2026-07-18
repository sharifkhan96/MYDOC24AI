from django.urls import path

from .views import MediaDetailView, MediaListView, MediaUploadView

urlpatterns = [
    path("upload/", MediaUploadView.as_view(), name="media-upload"),
    path("", MediaListView.as_view(), name="media-list"),
    path("<int:pk>/", MediaDetailView.as_view(), name="media-detail"),
]
