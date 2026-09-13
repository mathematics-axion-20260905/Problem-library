# Axion Science — Science Hub

The `Problem-library` repository is the Science Hub and canonical owner of the
cross-application Project and Scientific Object contracts. It also serves the
public problem library.

## Local development

```bash
npm install
npm run dev
```

The app is available at `http://localhost:3000` by default.

## Documentation

- [Scientific Object specification](docs/SCIENTIFIC_OBJECT_SPEC.md)
- [Cross-server ecosystem handoff](docs/CROSS_SERVER_ECOSYSTEM.md)
- [Deployment topology](docs/DEPLOYMENT_TOPOLOGY.md)
- [SEO standard](docs/SEO.md)
- [Direct Hostinger nginx template](ops/nginx-dirac.space.conf)

## Production

The current deployment uses Hostinger DNS records pointing directly to the VPS
and nginx routing for `dirac.space`, `math.dirac.space`,
`notebook.dirac.space`, and `writer.dirac.space`. Keep private production
environment files out of Git and use the versioned deployment template for
reverse-proxy changes.
