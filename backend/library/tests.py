import json

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
