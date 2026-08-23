import keyring
from keyring.errors import PasswordDeleteError

SERVICE_NAME = "Folio"
USERNAME = "groq_api_key"


def get_groq_key() -> str | None:
    return keyring.get_password(SERVICE_NAME, USERNAME)


def set_groq_key(key: str) -> None:
    keyring.set_password(SERVICE_NAME, USERNAME, key)


def delete_groq_key() -> None:
    try:
        keyring.delete_password(SERVICE_NAME, USERNAME)
    except PasswordDeleteError:
        pass
