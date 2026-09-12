from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    ProblemGroupViewSet,
    ProblemViewSet,
    ProjectFileDownloadView,
    ProjectFileView,
    ProjectViewSet,
    ScientificObjectRegistryView,
    ScientificObjectTransferView,
    overview,
)

router = DefaultRouter()
router.register("problem-groups", ProblemGroupViewSet, basename="problem-group")
router.register("problems", ProblemViewSet, basename="problem")
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("", overview),
    path("ecosystem/objects/", ScientificObjectRegistryView.as_view(), name="scientific-object-registry"),
    path("ecosystem/objects/<path:object_id>/", ScientificObjectRegistryView.as_view(), name="scientific-object-detail"),
    path("ecosystem/files/", ProjectFileView.as_view(), name="project-file-list-create"),
    path("ecosystem/files/<uuid:file_id>/", ProjectFileView.as_view(), name="project-file-detail"),
    path("ecosystem/files/<uuid:file_id>/download/", ProjectFileDownloadView.as_view(), name="project-file-download"),
    path("ecosystem/transfers/", ScientificObjectTransferView.as_view(), name="scientific-object-transfer-create"),
    path("ecosystem/transfers/<uuid:transfer_id>/", ScientificObjectTransferView.as_view(), name="scientific-object-transfer-detail"),
] + router.urls
