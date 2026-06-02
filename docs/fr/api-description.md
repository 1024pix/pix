# L'API Pix — Vue d'ensemble de l'architecture

## Présentation

L'API est un **backend HTTP Node.js** construit sur le framework [Hapi](https://hapi.dev/) (v21). Elle alimente la plateforme Pix — un service d'évaluation des compétences numériques et de certification pour le système éducatif français. Le code suit les principes du **Domain-Driven Design (DDD)** et constitue l'un des backends JavaScript les plus structurés que l'on puisse trouver dans un contexte open-source. Elle gère les utilisateurs, les évaluations, les certifications, les campagnes, les organisations, et bien plus encore.

---

## Points d'entrée

L'API peut démarrer sous trois formes de processus :

**`index.js` → Serveur HTTP.** Le processus principal. Il démarre le serveur Hapi, se connecte aux bases de données, initialise le pub/sub Redis et enregistre un endpoint de métriques Prometheus. Il gère l'arrêt gracieux sur `SIGTERM`/`SIGINT`.

**`worker.js` → Worker de jobs en arrière-plan.** Un second processus qui consomme des jobs depuis une file d'attente PostgreSQL (PG Boss). Les jobs sont regroupés en files `DEFAULT` et `FAST`. Ce processus partage le même code de domaine et d'infrastructure, mais écoute des tâches plutôt que des requêtes HTTP.

**`server.js` → Fabrique de serveur.** Ce n'est pas un processus à proprement parler, mais une fonction fabrique qui configure l'instance Hapi : enregistrement des plugins, mise en place des stratégies d'authentification (JWT, OIDC, SAML), enregistrement de toutes les routes des 22+ contextes délimités, et configuration de la gestion des erreurs, du CORS et des en-têtes HSTS.

---

## Les Contextes Délimités

Le répertoire `src/` est organisé en **contextes délimités** (*bounded contexts*), chacun représentant un domaine métier distinct. C'est la décision architecturale la plus importante du projet. Les principaux contextes sont :

- **`certification/`** — Le plus complexe, découpé en 5 sous-domaines : `configuration`, `enrolment`, `evaluation`, `results` et `session-management`. Gère tout, de la création de session aux relevés de notes en PDF.
- **`prescription/`** — Découpé en 7 sous-domaines. Gère les campagnes, les profils cibles, le suivi des participants et les relations organisation-apprenants.
- **`evaluation/`** — Moteur d'évaluation : sélection des épreuves, traitement des réponses, calcul des scores.
- **`devcomp/`** — Système de composants pédagogiques (DEVCOMP), un format de contenu distinct pour les parcours d'apprentissage modulaires.
- **`identity-access-management/`** — Authentification des utilisateurs, fédération OIDC, SSO SAML, gestion des comptes.
- **`organizational-entities/`** — Organisations, divisions, hiérarchies scolaires.
- **`learning-content/`** — Intégration avec le LCMS (Learning Content Management System) ; met en cache en mémoire les référentiels, compétences, tubes, acquis et épreuves.
- **`quest/`** — Couche de gamification (quêtes, récompenses).
- **`privacy/`** — Anonymisation des données utilisateurs et flux de suppression, outillage RGPD.
- **`llm/`** — Intégration d'API LLM pour des fonctionnalités assistées par IA.
- **`shared/`** — Infrastructure transversale : stratégies d'authentification globales, connexions aux bases de données, email, stockage, feature toggles et dépôts partagés.

Chaque contexte est autonome. Les appels inter-contextes passent par des interfaces explicitement définies, et non par des jointures SQL directes entre domaines.

---

## L'Architecture en Couches à l'Intérieur de Chaque Contexte

Chaque contexte délimité suit la même structure interne :

```
<contexte>/
  application/    ← Couche HTTP : contrôleurs, routes, sérialiseurs
  domain/         ← Logique métier : modèles, cas d'usage, erreurs
  infrastructure/ ← Accès aux données : dépôts, adaptateurs
```

**Couche domaine** — Logique métier pure, sans connaissance de HTTP ou SQL. Les modèles sont de simples classes JavaScript qui encapsulent les règles métier (`user.isAdminInOrganization()`, `session.isFinalized()`). Les cas d'usage sont des fonctions qui orchestrent les opérations du domaine ; ils acceptent leurs dépendances en paramètres pour faciliter les tests en isolation.

**Couche application** — Les contrôleurs reçoivent les requêtes Hapi, extraient les paramètres, appellent les cas d'usage et retournent des réponses sérialisées. Les sérialiseurs convertissent les objets du domaine vers/depuis le format [JSON:API](https://jsonapi.org/). Les routes sont des définitions Hapi avec des schémas de validation Joi.

**Couche infrastructure** — Les dépôts font la traduction entre les résultats SQL et les modèles du domaine. Ils utilisent directement Knex (le constructeur de requêtes) — pas d'ORM avec chargement paresseux ou relations magiques. Chaque requête est explicite.

---

## Stratégie Base de Données

L'API se connecte à **plusieurs bases de données PostgreSQL** :

| Connexion | Rôle |
|---|---|
| `DATABASE_URL` | Base transactionnelle principale |
| `JOBS_DATABASE_URL` | File de jobs PG Boss |

Il existe **794 fichiers de migration Knex** dans `db/migrations/`, représentant l'historique complet du schéma. Les extensions Knex apportent quelques améliorations : `whereInArray()` pour interroger les tableaux PostgreSQL, un parsing automatique des dates en chaînes `YYYY-MM-DD` (plutôt qu'en objets `Date` JavaScript), et l'injection de commentaires dans les requêtes pour l'observabilité.

Le **pattern `DomainTransaction`**, basé sur l'`AsyncLocalStorage` de Node.js, garantit que tout appel à un dépôt au sein du même cas d'usage partage automatiquement la même connexion/transaction, sans avoir à la propager manuellement dans chaque appel de fonction.

---

## Authentification

Trois stratégies coexistent, toutes enregistrées dans Hapi :

- **JWT** — La stratégie par défaut. Les tokens sont signés et vérifiés avec `jsonwebtoken`. La majorité des routes API l'utilisent.
- **OIDC** — Pour l'identité fédérée via `openid-client`
- **SAML** — Pour le SSO institutionnel via `samlify`.

L'état de session par cookie est géré par le plugin `@hapi/yar`. L'autorisation est appliquée via des pré-handlers Hapi qui s'exécutent avant les handlers de routes.

---

## Framework HTTP : Hapi

Hapi a été choisi plutôt qu'Express pour son système de plugins structuré et ses hooks de cycle de vie des requêtes intégrés. Principaux plugins enregistrés :

- **Pino** — Logs JSON structurés avec corrélation par requête (ID utilisateur, ID de requête).
- **Inert / Vision** — Service de fichiers statiques et templating.
- **hapi-swagger** — Documentation OpenAPI générée automatiquement depuis les définitions de routes.
- **Joi** — Validation des paramètres, query strings et payloads.

---

## Jobs en Arrière-plan

PG Boss v12 transforme PostgreSQL en file de jobs. Le processus `worker.js` interroge cette file pour récupérer du travail. Les jobs comprennent notamment l'envoi d'emails après certification, la génération d'exports, l'anonymisation de données utilisateurs et l'exécution d'agrégations planifiées.

Un pattern notable : les **success handlers**. Lorsqu'une transaction base de données est validée, un callback post-commit peut être planifié pour enqueuer un job. Cela évite la condition de course classique du type « publier un événement mais la transaction est ensuite annulée ».

---

## Observabilité

L'API accorde une grande importance à la supervision :

- **Pino** pour des logs structurés avec le contexte complet de la requête.
- **Métriques Datadog** (histogrammes, jauges) pour la latence, les taux d'erreur et la santé du pool de connexions.
- **Endpoint Prometheus** pour le scraping.
- **Métriques du pool de connexions** exportées par connexion.
- **Gestionnaire de contexte d'exécution** (`AsyncLocalStorage`) qui propage le contexte requête/job/script à travers toute la pile d'appels, afin que chaque ligne de log sache quel utilisateur l'a déclenchée, à quelle requête elle appartient, et combien de requêtes SQL ont été effectuées.

---

## Services d'Infrastructure Clés

| Service | Implémentation |
|---|---|
| Email | Nodemailer + API Brevo (Sendinblue) |
| Stockage de fichiers | S3 Generic via `@aws-sdk/client-s3` |
| Cache / KV | Redis (`ioredis`) avec fallback en mémoire |
| Verrouillage distribué | `RedisMutex` basé sur Redis |
| Pub/Sub | Redis + abonnements GraphQL |
| Génération de PDF | `pdfkit` + `pdf-lib` |
| Export Excel/CSV | `xlsx` + `@json2csv` |
| SAML/XML | `samlify`, `xml2js`, `xmlbuilder2` |

---

## Feature Toggles

`config/feature-toggles-config.js` définit plus de 100 feature flags. Chaque flag a une valeur par défaut et peut être surchargé par environnement via des variables d'environnement. Les flags sont étiquetés par équipe (`team-certif`, `team-prescription`, etc.) et par surface (`frontend`, `backend`). Cela permet aux équipes de déployer du code en mode sombre et d'activer les fonctionnalités indépendamment en production.

---

## Tests

Les tests se trouvent dans `tests/` avec trois niveaux :

- **Unitaires** — Logique pure, sans base de données, rapides.
- **Intégration** — Utilise une vraie base de données ; les fixtures `databaseBuilder` créent et nettoient les données.
- **Acceptance** — Aller-retours HTTP complets contre un serveur Hapi en cours d'exécution.

La stack est **Mocha** (runner) + **Chai** (assertions) + **Sinon** (espionnage/stubbing) + **Nock** (mock HTTP). Les tests sont organisés en miroir de la structure de domaine de `src/`.

---

## Résumé

L'API Pix est un monolithe Node.js large et bien structuré, organisé autour de **22 contextes délimités DDD**, chacun avec des couches **application / domaine / infrastructure** clairement séparées. Elle utilise **Hapi** pour HTTP, **Knex** pour SQL sur quatre bases de données PostgreSQL, **PG Boss** pour les jobs en arrière-plan, et une stack d'observabilité complète. L'architecture privilégie l'explicite sur le magique : pas de relations ORM, injection de dépendances par paramètres de fonctions, et gestion explicite des transactions. Elle est conçue pour la production et pensée pour fonctionner à l'échelle mondial.
