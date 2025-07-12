from datetime import datetime

from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives, send_mail

from users.models import User
from api.models import VerificationCode
from api.utils import generate_6_digit_code


class VerificationService:
    @staticmethod
    def send_verification_code(email):
        try:
            if User.objects.filter(email=email).exists():
                raise ValueError("Account with this email already exists")
            elif VerificationCode.objects.filter(email=email).exists():
                VerificationCode.objects.filter(email=email).delete()

            cache_key = f"sent_token_{email}"
            if cache.get(cache_key):
                raise ValueError(
                    "Too many requests. Please wait before requesting a new code"
                )
            else:
                cache.set(cache_key, True, 60)

            code = generate_6_digit_code()
            subject = "Your verification code"
            from_email = settings.EMAIL_HOST_USER

            html_content = render_to_string(
                "emails/verification_email.html",
                {"code": code, "current_year": datetime.now().year},
            )
            text_content = f"Enter this code on Coursecademy to confirm your email address -> {code}. If you did NOT request for this code, please ignore and report to Mickey, the developer."
            email_message = EmailMultiAlternatives(
                subject, text_content, from_email, [email]
            )
            email_message.attach_alternative(html_content, "text/html")
            email_message.send()

            verification_code = VerificationCode.objects.create(email=email, code=code)

            return verification_code.token

        except Exception as e:
            print(e)
            raise ValueError(e)

    @staticmethod
    def resend_verification_code(email):
        cache_key = f"sent_token_{email}"
        if cache.get(cache_key):
            raise ValueError(
                "Too many requests. Please wait before requesting a new code"
            )
        else:
            cache.set(cache_key, True, 60)

        VerificationCode.objects.filter(email=email).delete()
        VerificationService.send_verification_code(email=email)

    @staticmethod
    def verify_email(user_code, token):
        try:
            code_entry = VerificationCode.objects.get(
                token=token, is_used=False
            )
            if timezone.now() > code_entry.expiry_time:
                raise ValueError(
                    'Code expired. Please tap on "Resend" to get a new verification code sent to your email.'
                )
            
            if code_entry.code != user_code:
                raise ValueError('Incorrect code.')

            code_entry.is_used = True
            code_entry.save()

            return code_entry.email
        
        except VerificationCode.DoesNotExist:
            raise ValueError("Invalid or used token.")
