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

## BDD
Alimenter le fichier .env à partir de sample.env, notamment USER_COUNT
Exemple pour 1 million d'utilisateurs
````
USER_COUNT=1000000
````


### Local 
Exécuter `npm run generate-dataset`

### Scalingo
TODO: Créer configuration Scalingo sur high-level-tests  
Exécuter `scalingo run --region osc-fr1 --app <NOM_APPLICATION> --size M --detached npm run generate-dataset`    

# Exécution des tests

## Pré-requis :

Faire tourner l'API en désactivant reCAPTCHA et MailJet. [PR #478](https://github.com/1024pix/pix/pull/478)

## Procédure :

```
npm ci
npm start
npm report
```
