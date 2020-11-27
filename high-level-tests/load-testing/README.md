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

### Inscription (monkey test)
Ce scénario utilise des noms et prénoms issus de la [Big list of Naughty Strings](https://github.com/minimaxir/big-list-of-naughty-strings/)
pour vérifier que le serveur retourne soit un code retour habituel, soit un 422, mais surtout pas une 500.

Démarrer l'API en local

Exécuter dans ce dossier `npm run load-test:signup:naughty`

### Parcours complet
## Pré-requis :

Faire tourner l'API en désactivant reCAPTCHA et MailJet. [PR #478](https://github.com/1024pix/pix/pull/478)

## Procédure :

```
npm ci
npm start
npm report
```
