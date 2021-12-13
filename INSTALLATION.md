# Installation

## Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

- [Git](https://git-scm.com/) (2.6.4)
- [Node.js](https://nodejs.org/) (v14.17.0) et NPM (6.14.13)
- [Docker](https://docs.docker.com/get-started/) (20.10) avec [Docker Compose](https://docs.docker.com/compose/install/)

> ⚠️ Les versions indiquées sont celles utilisées et préconisées par l'équipe de développement. Il est possible que l'application fonctionne avec des versions différentes.

Assurez-vous aussi de ne pas avoir de process:

- sur le port 5432 (PostgreSQL), ou surchargez la variable `PIX_DATABASE_PORT`;
- sur le port 6379 (redis), ou surchargez la variable `PIX_CACHE_PORT`.

## Instructions

### 1. Récupérer le code source.

```bash
git clone git@github.com:1024pix/pix.git
```

Se rendre dans le répertoire projet.

```bash
cd pix
```

### 2 Configurer sous Windows (si applicable)

Il se peut que la dernière version `windows-build-tools` ne s'installe pas sur votre machine.
La `windows-build-tools@4.0.0` semble plus stable à l'installation.

```bash
npm install windows-build-tools
```

Définir dans `.npmrc` l'invite de commande à utiliser pour lancer les script-shell.

Ouvrir une invite de commande (`cmd.exe`) puis:

- installation 64bit :

```bash
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

- installation 32bit:

```bash
npm config set script-shell "C:\\Program Files (x86)\\git\\bin\\bash.exe"
```

Enfin, pour éviter les problèmes de retour ligne sous Windows:

```bash
git config --local core.autocrlf input
git rm -r --cached .
git reset --hard
```

### 3. Configurer l'environnement de développement

Configurer l'environnement :

- création de la BDD et du cache
- exécution des tests automatisés

Exécuter

```bash
npm run configure
```

⚠️ Compter entre 10 et 15mn pour l'exécution du script.

Pix s'appuie sur la bibliotèque [Dotenv](https://github.com/motdotla/dotenv) pour gérer les variables d'environnement en local.
Si besoin, éditer le fichier `.env` généré par le script pour l'adapter à vos besoins.

Vérifier les connexions à la base de donnée :

- de test manuel (présence de table et de données) `docker exec -it pix_postgres_1 psql -U postgres pix`;
- de test automatique (présence de tables) `docker exec -it pix_postgres_1 psql -U postgres pix_test`.

### 4. Démarrer les applications.

Exécuter

```bash
npm start
```

### 5. Accéder aux applications.

- [Pix API](http://localhost:3000) sur le port 3000
- [Pix App](http://localhost:4200) sur le port 4200
- [Pix Orga](http://localhost:4201) sur le port 4201
- [Pix Admin](http://localhost:4202) sur le port 4202
- [Pix Certif](http://localhost:4203) sur le port 4203

### 6. (Facultatif) Configurer les domaines locaux.

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

Pour configurer les domaines locaux, exécuter le script :

```bash
npm run domains:install
```

On peut ensuite démarrer le container docker nécessaire avec :

```bash
npm run domains:start
```

Et arrêter le container avec :

```bash
npm run domains:stop
```
