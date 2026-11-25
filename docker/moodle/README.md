## Run a local Moodle instance

Create (and optionnaly customize) the `.env` file :

```
cp sample.env .env
```

Requirements :

The [local domains containers](../local-domains/README.en.md) must be started before Moodle containers

Start Docker containers :

```
docker compose up -d
```

Visit http://localhost:8000/
