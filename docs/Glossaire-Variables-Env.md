# Glossaire des variables d'environnement
Ce tableau présente les différentes variables d'environnement utilisées sur nos applications.

Une explication est associée à chaque variable ainsi que leur utilisation (OUI / NON / OPT - OPTIONNELLE) en environnement :
* DEV — Développement
* INT — Intégration
* PROD — Production

### PIX API

| Variable  | Description | DEV | INT | PROD | Si absente |
| --- | --- | --- | --- | --- | --- |
| AIRTABLE_API_KEY |	Clef API / "Lien" de connexion pour Airtable | OUI	| OUI	| OUI | Pas de récupération du référentiel |
| AIRTABLE_BASE	BDD | Airtable ciblée	| OUI	| OUI	| OUI |
| APPLICATION_NAME |	Nom de l'API	| OUI	| OUI	| OUI |
| AUTH_SECRET |	Sécurité d'authentification	| OUI	| OUI	| OUI |
| BASE_URL |	URL associée à la review app	| OUI	| OUI	| OUI |
| BUILDPACK_SUBDIR |	Dossier de build ?	| OUI	| OUI	| OUI |
| BUILDPACK_URL |	Adresse du dossier de build ?	| OUI	| OUI	| OUI |
| CACHE_RELOAD_TIME |	Période de rechargement du cache au format cron	| OUI	| OUI	| OUI |
| DATABASE_CONNECTION_POOL_MAX_SIZE |	Nombre de connexion simultanées à la base de données	| OUI	| OUI	| OUI |
| DATABASE_SSL_ENABLED |	Sécurisation SSL de la base de données	| OUI	| OUI	| OUI |
| DATABASE_URL |	Définit l'adresse, le port et le nom de la BDD PostgreSQL à utiliser	| OUI	| OUI	| OUI |
| DAY_BEFORE_COMPETENCE_RESET_V2 |	Nombre de jours nécessaires avant la remise à jour d'une compétence en profil v2	| OPT	| OUI	| OUI |
| INFLUXDB_SSL_CA_CERT |	Certificat SSL pour Influx DB	| OUI	| OUI	| OUI |
| LOG_ENABLED |	Activation de l'affichage des logs	| OPT	| OPT	| true |
| LOG_LEVEL |	Niveau de détails affiché par les logs |	trace |	trace |	info |
| MAILJET_KEY |	Clef API pour MailJet	| NON	| OUI	| OUI |
| MAILJET_SECRET |	Secret de décryptage pour la clef API MailJet	| NON	| OUI	| OUI |
| METRICS_DB_NAME |	Nom de la base de données pour les Metrics Grafana	| OUI	| OUI	| OUI |
| METRICS_DB_PASSWORD |	Password de la base de données pour les Metrics Grafana	| OUI	| OUI	| OUI |
| METRICS_DB_URL |	Adresse URL de la base de données pour les Metrics Grafana	| OUI	| OUI	| OUI |
| METRICS_DB_USER |	Compte utilisateur de la base de données pour les Metrics Grafana	| OUI	| OUI	| OUI |
| NODE_ENV |	Environnement Node reflétant l'environnement courant de l'API	| OUI	| OUI	| OUI |
| NODE_OPTIONS | Options Node — utilisé ici pour définir son allocation mémoire autorisée |	staging |	staging |	production |
| NPM_CONFIG_AUDIT |	Vérification NPM de la configuration |	false |	false |	false |
| PAPERTRAIL_ENDPOINT |	URL de Papertrail	| OUI	| OUI	| OUI |
| PGSSLMODE |	Mode SSL pour postgresql |	require	| require |	require |
| PIXMASTER_EMAIL |	Compte Pix Master	| OUI	| OUI	| OUI |
| PIXMASTER_PASSWORD |	Mot de passe Pix Master	| OUI	| OUI	| OUI |
| REDIS_CACHE_KEY_LOCK_TTL |	Délais de verrouillage du cache Redis	| OUI	| OUI	| OUI |
| REDIS_CACHE_LOCKED_WAIT_BEFORE_RETRY |	Délais d'attente avant reconnexion au cache Redis	| OUI	| OUI	| OUI |
| REDIS_URL |	Adresse URL du cache Redis	| OUI	| OUI	| OUI |
| SAML_IDP_CONFIG |	???	| OUI	| OUI	| OUI |
| SCALINGO_POSTGRESQL_URL |	Adresse de la base de données postgresql de l'addon Scalingo	| OUI	| OUI	| OUI |
| SCALINGO_REDIS_URL |	Adresse du cache Redis de l'addon Scalingo	| OUI	| OUI	| OUI |
| SENTRY_DSN |	Adresse pour la collecte d'erreurs sur Sentry	| OUI	| OUI	| OUI |
| TEST_DATABASE_URL |	Définit l'adresse, le port et le nom de la BDD PostgreSQL à utiliser pour les tests automatiques	| OUI	| OUI	| NON |
| TOKEN_LIFE_SPAN |	Durée de vie du token de connexion	| OUI	| OUI	| OUI |

### PIX SITE 
| Variable  | Description | DEV | INT | PROD | Si absente |
| --- | --- | --- | --- | --- | --- |
| PRISMIC_API_ENDPOINT | URL d'accès à l'api de Prismic exemple : https://example-site.prismic.api/ | OUI	| OUI	| OUI
| PRISMIC_API_TOKEN	| Token Prismic | OUI	| OUI	| OUI | Pas de connexion à Prismic
