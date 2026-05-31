from rest_framework.exceptions import APIException
from rest_framework import status


class AppException(APIException):
    """Base application exception class"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "An error occurred"
    default_code = "error"

    def __init__(self, detail=None, code=None, status_code=None):
        if detail is None:
            detail = self.default_detail
        if code is None:
            code = self.default_code
        if status_code is not None:
            self.status_code = status_code

        super().__init__(detail=detail, code=code)


class NotFoundError(AppException):
    """Resource not found"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = "Resource not found"
    default_code = "not_found"


class ValidationError(AppException):
    """Validation error"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Validation error"
    default_code = "validation_error"


class PermissionDeniedError(AppException):
    """Permission denied"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = "Permission denied"
    default_code = "permission_denied"


class UnauthorizedError(AppException):
    """Unauthorized access"""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = "Unauthorized access"
    default_code = "unauthorized"


class DuplicateError(AppException):
    """Resource already exists"""
    status_code = status.HTTP_409_CONFLICT
    default_detail = "Resource already exists"
    default_code = "duplicate"


class BusinessLogicError(AppException):
    """Business logic error"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = "Business logic error"
    default_code = "business_logic_error"
