from enrollments.models import Enrollment
from enrollments.exceptions import NotEnrolledError
from .models import Certification

from django.utils.timezone import now

import io
from django.template.loader import render_to_string
from django.core.files.base import ContentFile
from django.utils import timezone
from weasyprint import HTML


def issue_certificate(user, course):
    try:
        enrollment = Enrollment.objects.get(
            user=user,
            course=course
        )
    except Enrollment.DoesNotExist:
        raise NotEnrolledError()
    
    certification, created = Certification.objects.get_or_create(
        enrollment=enrollment,
        defaults={'issued_at': now()}
    )

    if created:
        certification = _generate_certificate(enrollment)

    return certification


def _generate_certificate(enrollment):
    certification, created = Certification.objects.get_or_create(
        enrollment=enrollment,
        defaults={'issued_at': now()}
    )

    html_string = render_to_string("certifications/certificate_template.html", {
        "user": enrollment.user,
        "course": enrollment.course,
        "issued_at": certification.issued_at,
        "instructor": enrollment.course.instructor
    })

    pdf_file = io.BytesIO()
    HTML(string=html_string).write_pdf(pdf_file)

    certification.certificate_file.save(
        f"certificate_{enrollment.user.id}_{enrollment.course.id}.pdf",
        ContentFile(pdf_file.getvalue()),
        save=True
    )

    return certification