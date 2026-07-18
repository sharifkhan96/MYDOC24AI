from rest_framework import serializers

from .models import AnalysisResult, UploadedMedia


class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResult
        fields = ["id", "summary", "structured_findings", "confidence", "flagged_for_clinician", "ai_provider_used", "is_mock"]


class UploadedMediaSerializer(serializers.ModelSerializer):
    analysis = AnalysisResultSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = UploadedMedia
        fields = ["id", "kind", "file_url", "content_type", "analysis", "created_at"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if not obj.file:
            return None
        return request.build_absolute_uri(obj.file.url) if request else obj.file.url


class UploadMediaInputSerializer(serializers.Serializer):
    file = serializers.FileField()
    kind = serializers.ChoiceField(choices=UploadedMedia.Kind.choices)
