import random
import re


def generate_6_digit_code():
    return f"{random.randint(100000, 999999)}"


def is_valid_email(email):
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    if re.match(pattern, email):
        return True
    return False


def is_valid_full_name(name):
    return bool(re.fullmatch(r"[A-Za-z]+(?:[- ][A-Za-z]+)*", name))
