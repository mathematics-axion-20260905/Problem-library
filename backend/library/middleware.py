class ApiResponseHeadersMiddleware:
    """Keep anonymous API responses private from caches and search indexes."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.path.startswith("/api/") or request.path == "/healthz/":
            response["X-Robots-Tag"] = "noindex, nofollow, noarchive"
            response["Cache-Control"] = "no-store"
        return response
