from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Q
from rest_framework import generics, parsers, permissions, status
from rest_framework.decorators import api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.generics import get_object_or_404
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from api.utils import is_valid_email
from users.models import Profile, User
from users.serializers import (PasswordResetConfirmSerializer,
                               PasswordResetRequestSerializer,
                               ProfileSerializer, UserRegistrationSerializer,
                               UserSerializer)

from .services import VerificationService
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)


@api_view(["GET"])
def get_profile(request):
    profile = get_object_or_404(Profile, user=request.user)
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)


@api_view(["PATCH"])
@parser_classes([parsers.FormParser, parsers.MultiPartParser])
def update_profile(request):
    user = request.user
    profile = user.profile
    serializer = ProfileSerializer(profile, data=request.data, partial=True)
    if serializer.is_valid():
        updated_profile = serializer.save()
        serializer = ProfileSerializer(updated_profile)
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def send_confirmation_code_to_email(request):
    email = request.data.get("email")

    if not email:
        return Response(
            {"error": "Email address is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    else:
        email = email.strip().lower()

    if not is_valid_email(email):
        return Response(
            {"error": "Invalid email address"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        token = VerificationService.send_verification_code(email)
        return Response(
            {
                "message": "A confirmation code has been sent to your email",
                "user_verify_token": token,
                "user_verify_email": email,
            }
        )

    except ValueError as e:
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        return Response({"error": "Something went wrong"}, status=500)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def resend_confirmation_code_to_email(request):
    email = request.data.get("email")

    if not email:
        return Response(
            {"error": "Email address is required"}, status=status.HTTP_400_BAD_REQUEST
        )
    else:
        email = email.strip().lower()

    if not is_valid_email(email):
        return Response(
            {"error": "Invalid email address"}, status=status.HTTP_400_BAD_REQUEST
        )

    try:
        VerificationService.resend_verification_code(email)
        return Response(
            {"message": "A confirmatio34cn code has been sent to your email"}
        )
    except ValueError as e:
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        return Response({"error": "Something went wrong"}, status=500)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def verify_email(request):
    user_code = request.data.get("code")
    token = request.data.get("token")

    if not user_code:
        return Response(
            {"error": "User code required"}, status=status.HTTP_400_BAD_REQUEST
        )

    if not token:
        return Response({"error": "Token required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user_email = VerificationService.verify_email(user_code, token)
        return Response(
            {"message": "Email verification successful", "email": user_email}
        )
    except ValueError as e:
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        print(e)
        return Response({"error": "Something went wrong"}, status=500)


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(
            {"message": "User registration successful"}, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        remember_me = request.data.get("remember_me", False)
        logger.debug(f"Remember me --- > {remember_me}")

        if not email:
            return Response({"error": "Please enter your email"}, status=400)

        if not password:
            return Response({"error": "Please enter your password"}, status=400)

        email = email.strip().lower()
        user = authenticate(email=email, password=password)

        if user is None:
            return Response(
                {"error": "Invalid Credentials"}, status=status.HTTP_400_BAD_REQUEST
            )
        
        refresh = RefreshToken.for_user(user)
        if remember_me:
            refresh.set_exp(lifetime=timedelta(days=30))
            max_age = 60 * 60 * 24 * 30
        else:
            refresh.set_exp(lifetime=timedelta(days=1))
            max_age = None

        response = Response(
            {
                # "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": UserSerializer(user, context={"request": request}).data,
            },
            status=status.HTTP_200_OK,
        )
        response.set_cookie(
            key="refresh",
            value=str(refresh),
            httponly=True,
            samesite="None",
            secure=True,
            path="/",
            max_age=max_age,
        )
        return response
    


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
        except Exception:
            pass

        response = Response({'message': 'Logged out'})

        # Deleting the refresh cookie
        response.set_cookie(
            key="refresh",
            value="",
            httponly=True,
            samesite="None",
            secure=True,
            path="/",
            expires="Thu, 01 Jan 1970 00:00:00 GMT"
        )
        return response


class CookieTokenRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]

    def post(self, request: Request, *args, **kwargs) -> Response:
        refresh_token = request.COOKIES.get("refresh")

        if refresh_token is None:
            return Response({"error": "No refresh token"}, status=401)

        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])

        data = serializer.validated_data

        return Response(data)