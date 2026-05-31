from rest_framework.response import Response
from rest_framework import status


class SuccessResponse(Response):
    """Standard success response format"""
    def __init__(self, data=None, message="Success", status_code=status.HTTP_200_OK, **kwargs):
        response_data = {
            "success": True,
            "data": data or {},
            "message": message,
        }
        super().__init__(response_data, status=status_code, **kwargs)


class ErrorResponse(Response):
    """Standard error response format"""
    def __init__(self, error_code="error", message="An error occurred", status_code=status.HTTP_400_BAD_REQUEST, **kwargs):
        response_data = {
            "success": False,
            "error": {
                "code": error_code,
                "message": message,
            },
        }
        super().__init__(response_data, status=status_code, **kwargs)
