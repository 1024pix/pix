# Génération des JDD

## fichier SIECLE

Déterminer l'UAJ de l'organisation (par défaut, 1237457A).

``` sql
SELECT o.id, o.name, o."externalId" AS UAJ
FROM organizations o
WHERE o."isManagingStudents" = true ORDER BY o.id
``` 
Déterminer le volume à générer (par défaut, 5)  

Exécuter `npm run import-schooling-registration:generate-bulk-data <NOMBRE_UTILISATEURS> <UAI_ORGANISATION>`
Exemple  
- `npm run import-schooling-registration:generate-bulk-data 4000 1237457A`
- `npm run import-schooling-registration:generate-bulk-data`

Vous obtenez le message suivant et un fichier est généré (10 Mb pour 4000 utilisateurs)
``` shell script
Generating SIECLE file on organization 1237457A for 4000 users
SIECLE file for 4000 users in file SIECLE-organization-1237457A-4000-users.xml
```

Le fichier est 
- généré dans le dossier `load-testing` 
- non versionné si porte l'extension `.xml`

Note : vous pouvez sauvegarder les paramètres dans un fichier `.env` (voir `sample.env`)

# Exécution des tests

## Pré-requis :

Faire tourner l'API en désactivant reCAPTCHA et MailJet. [PR #478](https://github.com/1024pix/pix/pull/478)

## Procédure :

```
npm ci
npm start
npm report
```
