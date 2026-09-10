# Cross-server ecosystem handoff

The four products remain independent repositories and deploy units. They do
not rely on browser storage being shared. When apps run on different ports,
domains, or servers, a complete Scientific Object envelope is sent through the
short-lived ecosystem relay API.

## Required frontend variables

`NEXT_PUBLIC_ECOSYSTEM_CORE_URL` is the API base of the relay, including the
`/api` prefix. The current relay lives in the Problem-library backend, but it
can be moved to any reachable small server later.

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
independently on separate low-cost servers. The current relay is on the
Problem-library backend, so every frontend's `NEXT_PUBLIC_ECOSYSTEM_CORE_URL`
must point to that reachable API until a dedicated Platform Core is introduced.

## Transfer guarantees

- the relay stores the exact serialized envelope, not a markdown projection;
- the envelope keeps all revisions, provenance, structured payload and
  artifact metadata;
- the target validates the envelope and verifies payload hashes before local
  import;
- transfer records expire after six hours and are addressed by an unguessable
  UUID;
- the current relay is anonymous by design for this pre-auth stage. Add
  authentication, authorization, quotas and audit ownership before opening it
  to untrusted public traffic.

The relay is a transport boundary, not the permanent Object Registry. A
future Platform Core can replace it without changing the Scientific Object
envelope.
