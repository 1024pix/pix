# PIX-LOAD-TESTING

## Déploiement dans Scalingo

### Paramétrage

* Créer une application `pix-load-testing` dans Scalingo, la lier au repository
* Alimenter la variable d'environnement suivante
```sh
PROJECT_DIR=high-level-tests/load-testing
```
* Vérifier que le fichier `Procfile` contient un serveur web factice pour que le premier déploiement fonctionne
```sh
web: ruby -run -e httpd /dev/null -p $PORT
````

### Déploiement

* Une fois le déploiement effectué, passer background à 0 conteneurs

### Tester la connectivité

* Alimenter la variable d'environnement `TARGET_DEV_API_URL` avec l'URL de l'API cible pour les développement des tests de charge
```sh        
TARGET_DEV_API_URL=https://pix-api-load-testing.osc-fr1.scalingo.io
```
* Exécuter
```sh        
scalingo --region osc-fr1 -a pix-load-testing run npm run arti:test:dev
```
* Vérifier qu'un code retour 200 est renvoyé.
```sh        
Scenario counts:
    Obtenir la version de l API: 1 (100%)
Codes:
    200: 1
```

## Génération des JDD

### fichier SIECLE

* Déterminer l'UAJ de l'organisation (par défaut, 1237457A).
```sh
SELECT o.id, o.name, o."externalId" AS UAJ
FROM organizations o
WHERE o."isManagingStudents" = true ORDER BY o.id
``` 
* Déterminer le volume à générer (par défaut, 5)  
* Exécuter la commande
```sh 
npm run generate-bulk-data:schooling-registrations <NOMBRE_UTILISATEURS> <UAI_ORGANISATION>
```
* Exemple  
  * `npm run generate-bulk-data:schooling-registrations 4000 1237457A`
  * `npm run generate-bulk-data:schooling-registrations`
* Vous obtenez le message suivant et un fichier est généré (10 Mb pour 4000 utilisateurs)
```sh
Generating SIECLE file on organization 1237457A for 4000 users
SIECLE file for 4000 users in file SIECLE-organization-1237457A-4000-users.xml
```

## Exécution des test

### Pré-requis :

### Procédure :

```sh
npm ci
npm start
npm report
```
