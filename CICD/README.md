# Demo CI/CD (Clase universitaria)

Este proyecto es una mini app de login para enseñar CI/CD con GitHub Actions en dos niveles: un pipeline basico en runner y un deploy real en la nube con GCP. Esta carpeta no reemplaza su proyecto final; solo sirve para practicar el flujo Build -> Test -> Deploy.

Arquitectura objetivo:

```text
Usuario en internet
        |
        v
Firebase Hosting (frontend React)
        |
        +----> Cloud Run (backend Node.js) ----> Neon (PostgreSQL)
```

Resumen de niveles:

| Nivel | Que pasa en el deploy | Uso en clase |
|---|---|---|
| Nivel 1 | El backend se ejecuta temporalmente en el runner de GitHub | Entender la automatizacion base |
| Nivel 2 | El backend se despliega en Cloud Run con URL publica | Demo de CI/CD real en produccion |

Guia completa de configuracion:
- Ver [docs/SETUP.md](docs/SETUP.md)
