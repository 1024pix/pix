# Installation

## Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

- [Git](https://git-scm.com/) (2.6.4)
- [Node.js](https://nodejs.org/) (version utilisée disponible dans les fichiers [.nvmrc](https://github.com/1024pix/pix/blob/dev/.nvmrc)) il est recommandé d'utiliser un gestionnaire de versions tel que [nvm](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-started/) (20.10) avec [Docker Compose](https://docs.docker.com/compose/install/)

> ⚠️ Les versions indiquées sont celles utilisées et préconisées par l'équipe de développement. Il est possible que
> l'application fonctionne avec des versions différentes.

Assurez-vous aussi de ne pas avoir de processus écoutant sur le port:

- 5432 (PostgreSQL), ou surchargez la variable `PIX_DATABASE_PORT`;
- 6379 (redis), ou surchargez la variable `PIX_CACHE_PORT`.

## Instructions

### Récupérer le code source.

Récupérer le code source en local

```bash
git clone git@github.com:1024pix/pix.git && cd pix
```

⚠️ Cela prend environ 10 minutes avec une connexion standard.
Pour ne récupérer que la dernière version, qui ne prend qu'une minute, exécuter plutôt :

```bash
git clone --filter tree:0  git@github.com:1024pix/pix.git && cd pix
```

### Configurer l'environnement de développement sous Windows (si applicable)

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

### Configurer l'environnement de développement

Le script d'installation effectue les tâches suivantes :

- créer la base de données et le cache (conteneurs Docker)
- installer les librairies

Il prend moins de 5 minutes.
Exécutez-le avec  `npm run configure`

Vérifiez que le script s'est bien terminé : le message "🎉 Congratulations! Your environment has been set up." doit être
affiché. Si ce n'est pas le cas, contactez les équipes de développement en
ouvrant [une issue](https://github.com/1024pix/pix/issues).

### IDE

#### VSCode

Pour les utilisateur de vscode, des fichiers de config sont disponibles dans le dossier `.vscode`.
Pour les utiliser:
`cp .vscode/sample.launch.json .vscode/launch.json`
`cp .vscode/sample.settings.json .vscode/settings.json`

Les extensions recommandées peuvent se retrouver dans l'onglet extension en renseignant le filtre `@recommanded`

### Démarrer les applications

- Admin : `npm start --workspace=admin`
- Api : `npm start --workspace=api`
- App : `npm start --workspace=mon-pix`
- Certif : `npm start --workspace=certif`
- Orga : `npm start --workspace=orga`
- Pix1d : `npm run start:pix1d`

### Accéder aux applications

- [Pix Admin](http://localhost:4202) - port 4202 avec le compte `superadmin@example.net` / `pix123`
- [Pix API](http://localhost:3000/api) - port 3000
- [Pix App](http://localhost:4200) - port 4200 avec le compte `certif-success@example.net` / `pix123`
- [Pix Orga](http://localhost:4201) - port 4201 avec le compte `sup.admin@example.net` / `pix123`
- [Pix Certif](http://localhost:4203) - port 4203 avec le compte `certifsup@example.net` / `pix123`

Le mot de passe est par défaut `pix123`.
D'autres comptes sont disponibles dans les [seeds](api/db/seeds/data).

### Complément

#### Accès aux sources de données

Se connecter à la base de données :

- de test manuel : `docker exec -it pix-api-postgres psql -U postgres pix`;
- de test automatique : `docker exec -it pix-api-postgres psql -U postgres pix_test`.

Se connecter au cache :  `docker exec -it pix-api-redis redis-cli`

#### Configuration

Pix s'appuie sur la bibliothèque [Dotenv](https://github.com/motdotla/dotenv) pour gérer les variables d'environnement
en local.

Le script `scripts/configure.sh` génère un fichier [.env](api/.env) standard.

Vous pouvez l'adapter à vos besoins:

- activer le logging détaillé avec pretty-print :

```dotenv
LOG_ENABLED=true
LOG_LEVEL=debug
LOG_FOR_HUMANS=true
```

- permettre la suppression du schéma de la base de données sans arrêter l'API :

```dotenv
FORCE_DROP_DATABASE=true
```

- se connecter à un autre référentiel pédagogique que celui de base (test):

```dotenv
LCMS_API_KEY=<SOME_KEY>
LCMS_API_URL=<SOME_URL>
```

#### Configurer les domaines locaux

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
sudo npm run domains:install
```

Démarrer le conteneur docker :

```bash
npm run domains:start
```

Arrêter le conteneur :

```bash
npm run domains:stop
```

#### Exécuter le lint à chaque commit

Activer

Ce repository est configuré pour indiquer aux IDE Webstorm et Vscode la configuration du linter.
Malgré cela, il peut arriver que des erreurs de lint soient introduites.

Pour tenter de les corriger automatiquement lors du commit, installer un hook de pre-commit.

```
npm run local:add-optional-checks
```

Si vous souhaitez désactiver

```
npm run local:remove-optional-checks
```

#### Détecter des secrets

Installer un hook de pre-commit.

```
npm run local:add-optional-checks
```

Si vous souhaitez le désactiver

```
npm run local:remove-optional-checks
```

#### Tracer de manière détaillée l'envoi d'email

On peut tracer de manière détaillée (debug) l'appel de l'API d'email avec la
configuration d'une variable d'environnement :

```shell
export DEBUG="pix:mailer:email"
```

Cette variable d'environnement peut également être alimentée dans le fichier [.env](api/.env).

