from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MedicationReference
from .serializers import MedicationReferenceSerializer, MedicationSearchResultSerializer
from .services import get_or_generate_medication


class MedicationSearchView(generics.ListAPIView):
    serializer_class = MedicationSearchResultSerializer
    pagination_class = None

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        if not query:
            return MedicationReference.objects.none()
        return MedicationReference.objects.filter(name__icontains=query)[:10]


class MedicationLookupView(APIView):
    def get(self, request):
        name = request.query_params.get("name", "").strip()
        if not name:
            return Response({"detail": "A 'name' query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        medication, is_mock = get_or_generate_medication(name)
        data = MedicationReferenceSerializer(medication).data
        data["is_mock"] = is_mock
        return Response(data)


class MedicationDetailView(generics.RetrieveAPIView):
    queryset = MedicationReference.objects.all()
    serializer_class = MedicationReferenceSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self.get_serializer(instance).data
        data["is_mock"] = instance.generated_as_mock
        return Response(data)
