from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import OwnedByUserQuerySetMixin

from .models import UploadedMedia
from .serializers import UploadedMediaSerializer, UploadMediaInputSerializer
from .services import analyze_media


class MediaUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = UploadMediaInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uploaded_file = serializer.validated_data["file"]

        media = UploadedMedia.objects.create(
            user=request.user,
            file=uploaded_file,
            kind=serializer.validated_data["kind"],
            content_type=getattr(uploaded_file, "content_type", "") or "",
        )
        analyze_media(media)
        media.refresh_from_db()
        return Response(
            UploadedMediaSerializer(media, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class MediaListView(OwnedByUserQuerySetMixin, generics.ListAPIView):
    queryset = UploadedMedia.objects.select_related("analysis").all()
    serializer_class = UploadedMediaSerializer


class MediaDetailView(OwnedByUserQuerySetMixin, generics.RetrieveAPIView):
    queryset = UploadedMedia.objects.select_related("analysis").all()
    serializer_class = UploadedMediaSerializer
