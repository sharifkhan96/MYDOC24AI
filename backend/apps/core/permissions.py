class OwnedByUserQuerySetMixin:
    """Scopes a ModelViewSet's queryset to rows owned by the requesting user.

    Every non-reference app's ViewSet should mix this in first so that one
    user can never see or mutate another user's records.
    """

    owner_field = "user"

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.filter(**{self.owner_field: self.request.user})

    def perform_create(self, serializer):
        serializer.save(**{self.owner_field: self.request.user})
