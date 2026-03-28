from fastapi import FastAPI, HTTPException


def build_app(auth_service):
    app = FastAPI()

    @app.get("/health")
    def health():
        # Endpoint simple usado en pruebas de integracion.
        return {"ok": True}

    @app.post("/login")
    def login(payload: dict):
        try:
            # Delegar autenticacion a la capa de servicio.
            token = auth_service.login(payload["email"], payload["password"])
            return {"token": token}
        except ValueError as exc:
            # Mapear errores de dominio a respuestas HTTP.
            if str(exc) == "INVALID_CREDENTIALS":
                raise HTTPException(status_code=401, detail="invalid credentials")
            raise HTTPException(status_code=500, detail="internal error")

    return app
