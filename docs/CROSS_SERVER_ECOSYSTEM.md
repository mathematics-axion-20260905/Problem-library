# Cross-server ecosystem handoff

The four products remain independent repositories and deploy units. They do
not rely on browser storage being shared. When apps run on different ports,
domains, or servers, a complete Scientific Object envelope is sent through the
ecosystem core API. The core keeps a durable registry copy while the
short-lived relay remains available for one-click handoffs.

## Required frontend variables

`NEXT_PUBLIC_ECOSYSTEM_CORE_URL` is the API base of the ecosystem core,
including the `/api` prefix. The current core lives in the Problem-library
backend and can be moved to any reachable small server later.

```text
NEXT_PUBLIC_ECOSYSTEM_CORE_URL=http://core-host:8007/api
NEXT_PUBLIC_MATH_URL=http://math-host:3014/laboratory
NEXT_PUBLIC_NOTEBOOK_URL=http://notebook-host:3015/workspace
NEXT_PUBLIC_WRITER_URL=http://writer-host:3016/documents
NEXT_PUBLIC_SCIENCE_URL=http://science-host:3017/
NEXT_PUBLIC_MATH_OBJECT_URL=http://math-host:3014/laboratory
NEXT_PUBLIC_NOTEBOOK_OBJECT_URL=http://notebook-host:3015/workspace
NEXT_PUBLIC_WRITER_OBJECT_URL=http://writer-host:3016/new
NEXT_PUBLIC_SCIENCE_OBJECT_URL=http://science-host:3017/projects
```

Each frontend also needs its own backend API base in
`NEXT_PUBLIC_API_URL`. For example, Mathematics uses the Writer backend's
laboratory API, Notebook uses the Notebook backend, and Writer uses the Writer
backend.

## Pre-domain server checklist

Until a domain and TLS are available, each app may run on its own host or port.
Set the backend `.env` on every host rather than relying on development
defaults:

```text
DJANGO_DEBUG=false
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,<server-ip>
DJANGO_CORS_ALLOWED_ORIGINS=http://<science-ip>:<port>,http://<math-ip>:<port>,http://<notebook-ip>:<port>,http://<writer-ip>:<port>
DJANGO_CSRF_TRUSTED_ORIGINS=http://<science-ip>:<port>,http://<math-ip>:<port>,http://<notebook-ip>:<port>,http://<writer-ip>:<port>
DJANGO_SECURE_SSL_REDIRECT=false
```

Use the versioned backend systemd units in each repository's `ops/` directory.
They load the private `.env` file, expose `/healthz/`, and can be installed
independently on separate low-cost servers. The current core is on the
Problem-library backend, so every frontend's
`NEXT_PUBLIC_ECOSYSTEM_CORE_URL` must point to that reachable API until a
dedicated Platform Core is introduced.

## Transfer guarantees

- the registry and relay store the exact serialized envelope, not a markdown projection;
- the envelope keeps all revisions, provenance, structured payload and
  artifact metadata;
- the target validates the envelope and verifies payload hashes before local
  import;
- transfer records expire after six hours and are addressed by an unguessable
  UUID;
- the current relay is anonymous by design for this pre-auth stage. Add
  authentication, authorization, quotas and audit ownership before opening it
  to untrusted public traffic.

The Problem-library backend is the current pre-auth Platform Core. It owns
Project metadata, Scientific Object metadata/revisions and Project file
metadata/content. It does not run Math, Notebook Python or simulation jobs.
The registry is intentionally anonymous until the auth/RBAC phase, so it is
appropriate for private beta only.

## Database backup

The PostgreSQL deployment includes `ops/backup-postgres.sh` plus a daily
systemd service/timer. The job backs up both PostgreSQL and the configured
`MEDIA_ROOT` upload directory. Verify a manual backup with `systemctl start
axion-problem-library-postgres-backup.service`; keep the generated
`/var/backups/axion-problem-library` directory off the web root and perform a
restore drill against a separate database and media directory before opening
the service publicly.
