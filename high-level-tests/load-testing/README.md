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

# Exécuter les tests

## Connectivité
Ce test cible le segment `/api`, qui en requiert pas d'authentification.
Il est idéal pour vérifier les branchements avant de lancer un test de charge avec authentification.

Local 
```` shell script
npm run load-test:get-api-version:local
````

Scalingo 
```` shell script
scalingo run --app load-testing npm run load-test:get-api-version:review-app
````

## Parcours complet

### Pré-requis

Faire tourner l'API en désactivant reCAPTCHA et MailJet. [PR #478](https://github.com/1024pix/pix/pull/478)

### Procédure 

```
npm ci
npm start
npm report
```

## Authentification

### Paramétrage

Alimenter les variables d'environnement :
-  `TARGET_API_URL` avec l'URL de l'API
 - `TARGET_DATABASE_URL` avec la chaîne de connexion vers la BDD de l'API 
-  `TARGET_EXTERNAL_IDP_URL` avec l'URL de l'IDP externe


Ex en local
``` shell script        
TARGET_API_URL=http://localhost:3000/api
TARGET_DATABASE_URL=postgres://postgres@localhost:5432/pix
TARGET_EXTERNAL_IDP_URL=http://localhost:7000
```

### Authentification Pix

Local 
```` shell script
npm run load-test:get-profile:local
````

Scalingo 
```` shell script
scalingo run --app load-testing npm run load-test:get-profile:review-app  
````

### Authentification externe (SAML)

Local 
```` shell script
npm run load-test:get-profile-external-idp 
````

Scalingo 
```` shell script
scalingo run --app load-testing npm run load-test:get-profile-external-idp 
````
