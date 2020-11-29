# Déploiement dans Scalingo 

## Paramétrage
Créer une application dans Scalingo avec add-on PG
La lier au repository Pix

Alimenter la variable d'environnement suivante 
``` shell script
PROJECT_DIR=high-level-tests/load-testing
```

Vérifier que le `Procfile` contient un serveur web factice pour que le premier déploiement fonctionne.
````
web: ruby -run -e httpd /dev/null -p $PORT
````
## Déploiement
Déployer
Une fois le déploiement effectué, passer background à 0 conteneurs

``` shell script
scalingo --app load-testing pgsql-console
```

Exécuter la requête
``` sql
DROP TABLE IF EXISTS test_executions;
CREATE TABLE test_executions (id SERIAL PRIMARY KEY, api_version VARCHAR NOT NULL, started_at TIMESTAMP DEFAULT NOW(), ended_at TIMESTAMP, report JSONB);
```         

Alimenter les variables d'environnement suivantes :
- `TARGET_API_URL` : URL de l'application hébergeant l'API à tester (en général : load_testing_api)
- `TARGET_API_APPLICATION_NAME` : Nom de l'application hébergeant l'API à tester (en général : load_testing_api)
- `DATABASE_URL` : URL de connexion à la BDD où stocker les rapports de test (en général : load_testing)
- `RELEASE_TAG`: Release sur laquelle effectuer les tests
- `SCALINGO_TOKEN` : Token permettant de déployer une release
- `GITHUB_TOKEN` : Token permettant de télécharger une archive de la release sur Github
 
Exemple 
``` shell script
TARGET_API_URL=https://load-testing-api.osc-fr1.scalingo.io
DATABASE_URL=<APPLICATION_ADDON__DATABASE_URL>
TARGET_API_APPLICATION_NAME=load-testing-api
RELEASE_TAG=v2.224.0
SCALINGO_TOKEN=<TOKEN>
GITHUB_TOKEN=<TOKEN>
```

## Tester la connectivité

Alimenter la variable d'environnement `TARGET_API_URL` avec l'URL de l'API du test de charge
``` shell script        
TARGET_API_URL=https://load-test-api.osc-fr1.scalingo.io
```

Exécuter
``` shell script        
scalingo run --app load-testing npm run load-test:test-connectivity:review-app
```

Vérifier qu'un code retour 200 est renvoyé.
``` shell script        
  Scenario counts:
    Obtenir la version de l API: 1 (100%)
  Codes:
    200: 1
```

Vérifier la trace d'exécution
``` sql
SELECT id, started_at, ended_at, ( ended_at - started_at) AS duration FROM test_executions ORDER BY ended_at DESC LIMIT 5;
SELECT jsonb_pretty(data) FROM test_executions; 
SELECT
    report->'aggregate'->'timestamp'                  AS executed_at,
    report->'aggregate'->'scenarioDuration'->'median' AS median_duration_millis
FROM test_executions;
```

Si besoin, vider la table
``` sql
TRUNCATE test_executions;
```

# Génération des JDD

## fichier SIECLE

Déterminer l'UAJ de l'organisation (par défaut, 1237457A).

```
SELECT o.id, o.name, o."externalId" AS UAJ
FROM organizations o
WHERE o."isManagingStudents" = true ORDER BY o.id
``` 

Déterminer le volume à générer (par défaut, 5)  

Exécuter `npm run generate-bulk-data:schooling-registrations <NOMBRE_UTILISATEURS> <UAI_ORGANISATION>`
Exemple  
- `npm run generate-bulk-data:schooling-registrations 4000 1237457A`
- `npm run generate-bulk-data:schooling-registrations`

Vous obtenez le message suivant et un fichier est généré (10 Mb pour 4000 utilisateurs)
```
Generating SIECLE file on organization 1237457A for 4000 users
SIECLE file for 4000 users in file SIECLE-organization-1237457A-4000-users.xml
```

# Exécution des test

## Pré-requis :

Faire tourner l'API en désactivant reCAPTCHA et MailJet. [PR #478](https://github.com/1024pix/pix/pull/478)

## Procédure :

```
npm ci
npm start
npm report
```
