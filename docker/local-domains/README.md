# Configurer les domaines réseau locaux

Il est possible d'accéder aux applications Pix avec des domaines `*.dev.pix.<tld>`
plutôt que `localhost:port` :

- Mon Pix
  - http://app.dev.pix.fr/
  - http://app.dev.pix.org/
- Orga
  - http://orga.dev.pix.fr/
  - http://orga.dev.pix.org/
- Admin
  - http://admin.dev.pix.fr/
- Certif
  - http://certif.dev.pix.fr/

Pour configurer les domaines locaux, copier les déclarations de noms d’hôte du fichier [hosts.txt](./hosts.txt) dans le fichier d’hôtes de votre système (par exemple `/etc/hosts`).

Démarrer le conteneur docker :

```bash
npm run domains:start
```

Arrêter le conteneur :

```bash
npm run domains:stop
```

## Utiliser les domains réseaux locaux depuis un container Docker

Les domaines réseaux locaux sont disponibles sur un réseau Docker nommé `pix_local`.

Pour utiliser ces domaines depuis un container défini dans une autre configuration Docker Compose, la configuration suivante peut être utilisée :

```yaml
services:
  service1:
    image: ...
    # service1 est connecté au réseau par défaut et au réseau pix_local,
    # il pourra accéder aux domaines réseau locaux.
    networks:
      - default
      - pix_local

  # Sans configuration, service2 n’est connecté que au réseau par défaut,
  # il ne pourra pas accéder aux domaines réseau locaux.
  service2:
    image: ...

networks:
  # Définir un réseau par défaut pour la communication
  # entre les containers définis de cette configuration.
  default:
  # Définir pix_local comme réseau externe.
  pix_local:
    name: pix_local
    external: true
```
