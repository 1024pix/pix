# Installation

## Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

- [Git](https://git-scm.com/) (2.6.4)
- [Node.js](https://nodejs.org/) (version utilisée disponible dans les fichiers [.nvmrc](https://github.com/1024pix/pix/blob/dev/.nvmrc)) il est recommandé d'utiliser un gestionnaire de versions tel que [nvm](https://github.com/nvm-sh/nvm)
- [Docker](https://docs.docker.com/get-started/) (20.10)

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
- installer les librairies communes à tous les projets

Il prend moins de 5 minutes.
Exécutez-le avec `npm run configure`

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

Il faut d’abord démarrer l’API :

- Api : `npm run dev:api`

Puis démarrer sélectivement les applications dont vous avez besoin :

- Admin : `npm run dev:admin`
- App : `npm run dev:mon-pix`
- Certif : `npm run dev:certif`
- Orga : `npm run dev:orga`
- Junior : `npm run dev:junior`

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

Se connecter au cache : `docker exec -it pix-api-redis redis-cli`

#### Configuration

Pix s'appuie sur des fichiers `.env` pour gérer les variables d'environnement en local.

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

#### Charger des SSO OIDC lors du chargement des seeds

Le chargement des SSO OIDC lors du chargement des seeds est effectué depuis la
variable d’environnement `OIDC_PROVIDERS` si elle définie. Si elle est définie
elle doit contenir du JSON. Écrire ce JSON est assez pénible car il y a beaucoup
de propriétés à fournir et qu’on ne peut actuellement pas utiliser de retours à
la ligne dans le fichier `.env` (même si ce serait théoriquement possible avec
la notation here-document). Aussi un fichier d'exemple
`OIDC_PROVIDERS.example.json` est fourni avec un mode opératoire facilité décrit
ci-dessous.

1. Copier et adapter le fichier `OIDC_PROVIDERS.example.json` à votre besoin :

   ```shell
   cp OIDC_PROVIDERS.example.json OIDC_PROVIDERS.json
   ```

2. Définir la variable d’environnement `OIDC_PROVIDERS` avec le contenu du
   fichier `OIDC_PROVIDERS.json` :

   ```shell
   export OIDC_PROVIDERS=$(cat OIDC_PROVIDERS.json)
   ```

3. Exécuter le chargement des seeds avec du debug pour constater le bon
   chargement des SSO OIDC :

   ```shell
   export DEBUG="pix:oidc-providers:*"
   npm run db:reset
   ```

#### Tester les envois d'e-mails

##### Avec une interface web

Il est possible de tester les envois d'e-mails avec [Mailpit](https://mailpit.axllent.org/), un outil qui simule un
serveur SMTP et offre une interface web permettant de voir les e-mails envoyés.

Il faut pour cela ajouter deux variables d'environnement au `.env`:

```shell
MAILING_ENABLED=true
MAILING_PROVIDER=mailpit
```

Mailpit est inclus dans les images du fichier docker-compose.yml et sera donc lancé automatiquement.

On peut accéder à l'interface web Mailpit à l'adresse http://localhost:8025.

##### Dans un terminal

On peut également tracer de manière détaillée (debug) l'appel de l'API d'email avec la
configuration d'une variable d'environnement :

```shell
export DEBUG="pix:mailer:email"
```

Cette variable d'environnement peut également être alimentée dans le fichier [.env](api/.env).
