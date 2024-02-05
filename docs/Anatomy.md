# Anatomie de la plateforme

## Organisation générale du code

Les applications Pix (Pix API, Pix App, Pix Orga, Pix Certif et Pix Admin) sont organisées au travers un dépôt Git de type [monorepo](https://en.wikipedia.org/wiki/Monorepo).

```
pix                      → Sources de la plateforme
 └ .circleci             → Répertoire de configuration de CircleCI
    └ config.yml         → Fichier principal de configuration de CircleCI
 └ admin                 → Sources de l'application Pix Admin
 └ api                   → Sources de l'application Pix API
 └ certif                → Sources de l'application Pix Certif
 └ docs                  → Répertoire des documents techniques et méthodologiques 
    └ adr                → Registre des ADR (Architecture Decision Records)
    └ assets             → Images utilisées dans la documentation
 └ high-level-tests      → Répertoire de tests très haut niveau  
    └ e2e                → Tests fonctionnels avec Cypress.js
    └ load-testing       → Tests de charge et de performance Artillery.io
 └ mon-pix               → Sources de l'application Pix App
 └ node_modules          → (généré) Dépendances pour les scripts et tâches NPM générales
 └ orga                  → Sources de l'application Pix Orga
 └ scripts               → Divers scripts utilisés pour l'exploitation et le support
 └ .adr-dir              → Fichier de configuration de l'outil npryce/adr-tools pour gérer les ADR  
 └ .buildpacks           → Fichier de définition des buildpacks Scalingo à utiliser
 └ .editorconfig         → Fichier de configuration pour l'outil / standard EditorConfig
 └ .eslintrc.cjs        → Fichier de configuration général pour l'outil de linting ESLint
 └ .gitignore            → Listing des fichiers / répertoires à ignorer de Git 
 └ .slugignore           → Listing des fichiers / répertoires que Scalingo doit ignorer au moment du build
 └ CHANGELOG.md          → Listing des modifications opérées sur la plateforme (mise à jour automatique)
 └ docker-compose.yml    → Fichier utilisé pour les développements afin de démarrer un environnement iso-prod
 └ INSTALLATION.md       → Instructions d'installation de la plateforme en local
 └ LICENSE.md            → Texte de la licence logicielle utilisée sur Pix (AGPL-3.0)
 └ nginx.conf.erb        → Fichier de configuration du reverse proxy / API gateway (Nginx) 
 └ package.json          → Fichier de définition généré de la plateforme
 └ package-lock.json     → Listing des dépendances
 └ README.md             → Fichier de présentation du projet
 └ scalingo.json         → Fichier de configuration des Review Apps Scalingo
```


## Anatomie d'une application Ember

cf. [Documentation officielle d'Ember](https://guides.emberjs.com/release/getting-started/anatomy-of-an-ember-app/)


## Anatomie de l'application Pix API

Le code de l'application Pix API s'inspire des principes formulés par Robert C. Martin dans son modèle [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).

```
api                                 → Sources de l'application Pix API
 └ bin                              → Répertoire de binaires
    └ www                           → Binaire d'exécution de l'API
 └ db                               → Fichiers de configuration et d'alimentation de la BDD 
    └ migrations                    → Répertoire des fichiers de migration de la BDD
    └ seeds                         → Répertoire des fichiers d'alimentation de la BDD pour développement local
    └ knex-database-connection.js   → Fichier de configuration de l'outil de requêtage SQL (Knex.js)
    └ knexfile.js                   → Fichier de configuration des environnements Knex
 └ lib                              → Sources de l'API
    └ application                   → Fichiers de définition des routes et contrôleurs HTTP
    └ domain                        → Objets du domaine (entités, aggrégats, value objects, services, use cases) 
       └ models                     → Entités, aggrégats et value objects du domaine 
       └ services                   → Services métier du domaine
       └ usecases                   → Cas d'usage métier
       └ validators                 → Validateurs de règles fonctionnelles
       └ constants.js               → Listing des variables métier utilisées dans l'application
       └ errors.js                  → Listing des erreurs métier
    └ infrastructure                → Ensemble des modules et briques techniques
       └ adapters                   → Convertisseurs d'objets issus de sources de données (PG, Airtable) en objets du domaine
       └ caches                     → Classes et modules utilisés pour le caching de données
       └ data                       → Modèles de données Bookshelf
       └ datasources                → Modèles de données Airtable
       └ files                      → Templates de fichiers utilisés pour l'import / export de données 
       └ mailers                    → Classes et modules utilisées pour l'envoi d'e-mails
       └ plugins                    → (déprécié) Plugins Hapi.js _home made_
       └ repositories               → Gestionnaires d'accès aux données (PG, Airtable) 
       └ serializers                → Convertisseurs de données Domain objects ←→ HTTP request objects
       └ utils                      → Ensemble de classes et modules utilitaires ou helpers 
       └ validators                 → (déprécié) Validateurs techniques
       └ airtable.js                → Wrapper de client Airtable 
       └ bookshelf.js               → Instance de gestionnaire Bookshelf
       └ logger.js                  → Instance de logger Bunyan
 └ node_modules                     → (généré) Dépendances pour les scripts et tâches NPM générales
 └ scripts                          → Divers scripts 
 └ tests                            → Sources des tests suites et test cases
    └ acceptance                    → Tests haut niveau pour les scripts et certaines routes 
    └ docs                          → Tests documentant l'emploi de dépendances utilisées sur Pix (ex : Bookshelf)
    └ integration                   → Tests utilisées pour couvrir les Routes, les modèles Bookshelf, les Repositories, et le traitement de fichiers  
    └ tooling                       → Outillage (Factories, DataBuilders) pratique pour les tests
    └ unit                          → Tests unitaires (Controllers, Serializers, Models, Services et Usecases du domaine, Validators, etc.) 
    └ .eslintrc.cjs                → Fichier de configuration général pour l'outil de linting ESLint
    └ test-helper.js                → Module de configuration des libs utilisées pour les tests (Mocha, Sinon, Chai, etc.)
 └ .buildpacks                      → Fichier de définiion des buildpacks Scalingo à utiliser
 └ .env                             → (généré/édité) Fichier avec les variables d'environnement pour le développement local
 └ .eslintrc.cjs                   → Fichier de configuration général pour l'outil de linting ESLint
 └ .istanbul.yml                    → Fichier de configuration pour la couverture de code
 └ .slugignore                      → Listing des fichiers / répertoires que Scalingo doit ignorer au moment du build
 └ package.json                     → Fichier de définition généré de la plateforme
 └ package-lock.json                → Listing des dépendances
 └ Procfile                         → Fichier de démarrage du conteneur Scalingo 
 └ sample.env                       → Template des fichiers <NODE_ENV>.env
 └ server.js                        → Instance du Web server Hapi.js
```
