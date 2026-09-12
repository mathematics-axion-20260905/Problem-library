import json

from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase


class ScientificObjectTransferTests(APITestCase):
    def test_health_probe(self):
        response = self.client.get("/healthz/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["status"], "ok")

    def test_transfer_round_trip_preserves_exact_payload(self):
        payload = json.dumps(
            {
                "transferSchemaVersion": "1.0",
                "exportedAt": "2026-09-10T00:00:00.000Z",
                "object": {
                    "id": "object-1",
                    "projectId": "project-1",
                    "kind": "calculation",
                    "schemaVersion": "1.0",
                    "title": "Integral",
                    "sourceApp": "math",
                    "currentRevision": 1,
                },
                "revisions": [
                    {
                        "objectId": "object-1",
                        "revision": 1,
                        "payload": {"value": "42", "points": [1, 2, 3]},
                        "provenance": {"sourceApp": "math"},
                    }
                ],
            },
            separators=(",", ":"),
        )

        created = self.client.post("/api/ecosystem/transfers/", {"payload": payload}, format="json")
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)

        fetched = self.client.get(f"/api/ecosystem/transfers/{created.data['transferId']}/")
        self.assertEqual(fetched.status_code, status.HTTP_200_OK)
        self.assertEqual(fetched.data["payload"], payload)
        self.assertEqual(fetched.data["contentHash"], created.data["contentHash"])

    def test_invalid_transfer_is_rejected(self):
        response = self.client.post("/api/ecosystem/transfers/", {"payload": "{}"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_registry_round_trip_preserves_exact_payload_and_is_idempotent(self):
        payload = json.dumps(
            {
                "transferSchemaVersion": "1.0",
                "exportedAt": "2026-09-10T00:00:00.000Z",
                "object": {
                    "id": "object-registry-1",
                    "projectId": "project-1",
                    "kind": "calculation",
                    "domain": "math",
                    "schemaVersion": "1.0",
                    "title": "Integral",
                    "sourceApp": "math",
                    "currentRevision": 1,
                    "metadata": {"unit": "m"},
                },
                "revisions": [
                    {
                        "objectId": "object-registry-1",
                        "revision": 1,
                        "payload": {"value": "42", "points": [1, 2, 3]},
                        "provenance": {"sourceApp": "math"},
                    }
                ],
            },
            separators=(",", ":"),
        )

        created = self.client.post("/api/ecosystem/objects/", {"payload": payload}, format="json")
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data["serializedPayload"], payload)
        repeated = self.client.post("/api/ecosystem/objects/", {"payload": payload}, format="json")
        self.assertEqual(repeated.status_code, status.HTTP_200_OK)

        fetched = self.client.get("/api/ecosystem/objects/object-registry-1/")
        self.assertEqual(fetched.status_code, status.HTTP_200_OK)
        self.assertEqual(fetched.data["serializedPayload"], payload)
        listed = self.client.get("/api/ecosystem/objects/?project=project-1")
        self.assertEqual(listed.data["count"], 1)

    def test_project_file_upload_list_and_download(self):
        uploaded = SimpleUploadedFile("measurements.csv", b"x,y\n1,2\n", content_type="text/csv")
        created = self.client.post(
            "/api/ecosystem/files/",
            {"projectId": "project-1", "file": uploaded, "metadata": json.dumps({"source": "test"})},
            format="multipart",
        )
        self.assertEqual(created.status_code, status.HTTP_201_CREATED)
        self.assertEqual(created.data["originalName"], "measurements.csv")
        listed = self.client.get("/api/ecosystem/files/?project=project-1")
        self.assertEqual(listed.data["count"], 1)
        downloaded = self.client.get(f"/api/ecosystem/files/{created.data['id']}/download/")
        self.assertEqual(downloaded.status_code, status.HTTP_200_OK)
        self.assertEqual(b"".join(downloaded.streaming_content), b"x,y\n1,2\n")
