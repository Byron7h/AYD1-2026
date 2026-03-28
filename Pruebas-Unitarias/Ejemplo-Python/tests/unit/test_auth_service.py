from unittest.mock import Mock

import pytest

from src.auth_service import AuthService


def test_login_success_returns_token():
    # Arrange: mocks para repo, hasher y token.
    user_repo = Mock()
    password_hasher = Mock()
    token_service = Mock()

    user_repo.find_by_email.return_value = {
        "id": 10,
        "email": "test@demo.com",
        "password_hash": "hash-123",
        "role": "student",
    }
    password_hasher.compare.return_value = True
    token_service.sign.return_value = "token-abc"

    service = AuthService(user_repo, password_hasher, token_service)

    # Act
    token = service.login("test@demo.com", "secret")

    # Assert
    assert token == "token-abc"
    user_repo.find_by_email.assert_called_once_with("test@demo.com")
    password_hasher.compare.assert_called_once_with("secret", "hash-123")
    token_service.sign.assert_called_once_with({"user_id": 10, "role": "student"})


def test_login_fails_when_user_missing():
    # Arrange: el repo retorna None (usuario inexistente).
    user_repo = Mock()
    password_hasher = Mock()
    token_service = Mock()

    user_repo.find_by_email.return_value = None

    service = AuthService(user_repo, password_hasher, token_service)

    # Act + Assert
    with pytest.raises(ValueError, match="INVALID_CREDENTIALS"):
        service.login("missing@demo.com", "123")
