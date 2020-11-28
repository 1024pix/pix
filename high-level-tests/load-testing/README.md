# Déploiement dans Scalingo 

## Paramétrage
Créer une application dans Scalingo, la lier au repository

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
