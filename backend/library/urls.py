from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ProblemGroupViewSet, ProblemViewSet, ProjectViewSet, ScientificObjectTransferView, overview

router = DefaultRouter()
router.register("problem-groups", ProblemGroupViewSet, basename="problem-group")
router.register("problems", ProblemViewSet, basename="problem")
router.register("projects", ProjectViewSet, basename="project")

urlpatterns = [
    path("", overview),
    path("ecosystem/transfers/", ScientificObjectTransferView.as_view(), name="scientific-object-transfer-create"),
    path("ecosystem/transfers/<uuid:transfer_id>/", ScientificObjectTransferView.as_view(), name="scientific-object-transfer-detail"),
] + router.urls
