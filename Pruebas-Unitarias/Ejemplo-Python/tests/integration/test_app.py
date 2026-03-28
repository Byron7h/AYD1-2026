from fastapi.testclient import TestClient

from src.app import build_app


class AuthStub:
    def __init__(self, mode="ok"):
        self.mode = mode

    def login(self, _email, _password):
        if self.mode == "ok":
            return "token-demo"
        raise ValueError("INVALID_CREDENTIALS")


def test_health_returns_200():
    # Arrange: app con servicio simulado.
    app = build_app(AuthStub("ok"))
    client = TestClient(app)

    # Act
    res = client.get("/health")

    # Assert
    assert res.status_code == 200
    assert res.json() == {"ok": True}


def test_login_returns_401_for_invalid_credentials():
    # Arrange: el stub de auth retorna INVALID_CREDENTIALS.
    app = build_app(AuthStub("invalid"))
    client = TestClient(app)

    # Act
    res = client.post("/login", json={"email": "demo@demo.com", "password": "wrong"})

    # Assert
    assert res.status_code == 401
    assert res.json()["detail"] == "invalid credentials"
