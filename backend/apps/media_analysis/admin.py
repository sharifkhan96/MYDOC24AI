from django.contrib import admin

from .models import AnalysisResult, UploadedMedia

admin.site.register(UploadedMedia)
admin.site.register(AnalysisResult)
