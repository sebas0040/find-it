from django.http import JsonResponse
from django.utils import timezone
from django.db import connection


def healthcheck(request):
    """API health check endpoint."""
    try:
        # Check database connection
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')

        return JsonResponse({
            'status': 'ok',
            'timestamp': timezone.now().isoformat(),
        }, status=200)
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e),
        }, status=503)
