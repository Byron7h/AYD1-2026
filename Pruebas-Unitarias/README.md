# Guia de clase: Unitarias e Integracion (Node y Python)

## 1) Recomendacion directa para tu clase

Usa como ejemplo principal **Pruebas-Unitarias**.

Motivos:
- Ya esta orientado a testing (unitarias + integracion).
- Estructura simple para explicar Arrange / Act / Assert.
- Incluye CI con GitHub Actions.
- Tiene cobertura reportada y facil de mostrar.

No uses **Clase8-SOLID** como ejemplo principal de pruebas.
Ese proyecto esta mas enfocado en Docker y despliegue.

## 2) Cobertura actual que puedes mostrar

Del reporte en `coverage/lcov-report/index.html`:
- Statements: 90.62%
- Branches: 70%
- Functions: 100%
- Lines: 90.62%

Lectura didactica:
- Bien cubiertas funciones y flujo base.
- Faltan ramas (branches), ideal para explicar "que falta probar".

## 3) Definiciones claras (test doubles)

- Dummy:
  - Objeto de relleno, casi no se usa en asserts.
- Stub:
  - Retorna datos fijos para controlar el flujo.
  - Ejemplo: `clock.now()` devuelve fecha fija.
- Mock:
  - Doble con expectativas de llamadas.
  - Ejemplo: verificar que `tokenService.sign(...)` fue llamado con cierto payload.
- Spy:
  - Observa llamadas a una funcion real o mock sin cambiar toda su logica.
- Fake:
  - Implementacion simplificada pero funcional.
  - Ejemplo: repositorio en memoria.

Nota importante:
- Lo que dijiste como "Subs" normalmente se refiere a **Stubs**.

## 4) Unitarias vs Integracion (para explicar en clase)

Unitarias:
- Prueban una sola unidad de negocio.
- Se aislan dependencias externas con doubles (mocks/stubs/fakes).
- Son rapidas y muy especificas.

Integracion:
- Prueban colaboracion entre componentes reales de la app.
- En este repo: ruta HTTP + Express + traduccion de errores.
- Puedes mockear fronteras externas (DB, APIs externas), pero no toda la app.

Regla practica para tus companeros:
- Unitarias: 70-80% del total de pruebas.
- Integracion: 20-30% del total.

## 5) Que mostrar en Node.js (este repo)

### Archivos clave
- `src/authService.js`
- `src/appointmentService.js`
- `src/app.js`
- `tests/unit/authService.test.js`
- `tests/unit/appointmentService.test.js`
- `tests/integration/app.test.js`

### 5 unitarias sugeridas (plantilla para el proyecto de ellos)

1. Login exitoso retorna token (mock de repo/hash/token).
2. Login falla si usuario no existe (error INVALID_CREDENTIALS).
3. Cita en el pasado falla (APPOINTMENT_MUST_BE_FUTURE).
4. Cita en conflicto falla (APPOINTMENT_CONFLICT).
5. Cita futura sin conflicto se guarda (stub de reloj + fake repo).

### 2 integracion sugeridas

1. `GET /health` responde 200 y `{ ok: true }`.
2. `POST /login` traduce error de negocio a HTTP 401.

## 6) Guion rapido de exposicion (20-25 min)

1. Contexto (2 min):
- "No buscamos 1000 tests; buscamos tests utiles y mantenibles".

2. Unitarias (8 min):
- Explicar AAA (Arrange, Act, Assert).
- Mostrar mock en authService.
- Mostrar stub + fake en appointmentService.

3. Integracion (8 min):
- Mostrar supertest contra app Express.
- Explicar por que aqui se prueba endpoint real.

4. Coverage (4 min):
- Abrir reporte HTML.
- Explicar por que 100% funciones no implica 100% calidad.

5. Cierre (2 min):
- "Tarea: construyan 5 unitarias + 2 integracion para su propio backend".

## 7) Version Python equivalente (para que emulen)

Si ellos tambien usan Python, este mismo patron se mapea con:
- pytest (unitarias)
- FastAPI + TestClient (integracion)
- unittest.mock / monkeypatch (mocks y stubs)

### Ejemplo unitario Python (mock)

```python
# tests/test_auth_service.py
from unittest.mock import Mock
import pytest

class AuthService:
    def __init__(self, user_repo, hasher, token_service):
        self.user_repo = user_repo
        self.hasher = hasher
        self.token_service = token_service

    def login(self, email, password):
        user = self.user_repo.find_by_email(email)
        if not user:
            raise ValueError("INVALID_CREDENTIALS")
        if not self.hasher.compare(password, user["password_hash"]):
            raise ValueError("INVALID_CREDENTIALS")
        return self.token_service.sign({"user_id": user["id"], "role": user["role"]})


def test_login_success_returns_token():
    user_repo = Mock()
    hasher = Mock()
    token_service = Mock()

    user_repo.find_by_email.return_value = {
        "id": 10,
        "email": "test@demo.com",
        "password_hash": "hash-123",
        "role": "student",
    }
    hasher.compare.return_value = True
    token_service.sign.return_value = "token-abc"

    service = AuthService(user_repo, hasher, token_service)

    token = service.login("test@demo.com", "secret")

    assert token == "token-abc"
    user_repo.find_by_email.assert_called_once_with("test@demo.com")
    hasher.compare.assert_called_once_with("secret", "hash-123")
    token_service.sign.assert_called_once_with({"user_id": 10, "role": "student"})


def test_login_fails_when_user_missing():
    user_repo = Mock()
    hasher = Mock()
    token_service = Mock()

    user_repo.find_by_email.return_value = None

    service = AuthService(user_repo, hasher, token_service)

    with pytest.raises(ValueError, match="INVALID_CREDENTIALS"):
        service.login("missing@demo.com", "123")
```

### Ejemplo integracion Python (FastAPI)

```python
# tests/test_app_integration.py
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient


def build_app(auth_service):
    app = FastAPI()

    @app.get("/health")
    def health():
        return {"ok": True}

    @app.post("/login")
    def login(payload: dict):
        try:
            token = auth_service.login(payload["email"], payload["password"])
            return {"token": token}
        except ValueError as e:
            if str(e) == "INVALID_CREDENTIALS":
                raise HTTPException(status_code=401, detail="invalid credentials")
            raise HTTPException(status_code=500, detail="internal error")

    return app


class AuthStub:
    def __init__(self, mode="ok"):
        self.mode = mode

    def login(self, _email, _password):
        if self.mode == "ok":
            return "token-demo"
        raise ValueError("INVALID_CREDENTIALS")


def test_health_200():
    client = TestClient(build_app(AuthStub("ok")))
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"ok": True}


def test_login_401_for_invalid_credentials():
    client = TestClient(build_app(AuthStub("invalid")))
    res = client.post("/login", json={"email": "demo@demo.com", "password": "wrong"})
    assert res.status_code == 401
    assert res.json()["detail"] == "invalid credentials"
```

## 8) Mensaje final para tus companeros

"Copien la estructura y no solo el codigo:
- separen logica de negocio,
- inyecten dependencias,
- escriban unitarias primero para reglas,
- luego integracion para endpoints,
- y revisen coverage para detectar huecos."