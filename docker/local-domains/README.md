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
