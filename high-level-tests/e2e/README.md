## Cypress

Cypress est un framework de test end to end (back-end + front-end).
Il est utilisé ici pour les tests de non-régression sur les chemins fonctionnels entiers. 


### Installer un navigateur

Installer Chrome

**Note** 

Toutes les versions de Chrome sont supportées à partir de la [version 64 (2018)](https://docs.cypress.io/guides/guides/launching-browsers.html#Chrome-Browsers)

Cypress supporte [d'autres navigateurs](https://docs.cypress.io/guides/guides/cross-browser-testing.html#Continuous-Integration-Strategies):
* Chromium
* Firefox
* Edge

Cependant, la suite de test Pix étant lancée dans la CI sur Chrome, il est suggéré de l'exécuter en local sur Chrome pour des résultats déterministes.

### Installer Cypress

#### Module npm
Installer le module npm cypress
```
cd high-level-tests/e2e
npm ci
npx cypress install  
```

#### Wrapper Cypress
Le téléchargement prend quelques minutes
```
╰─$ npx cypress install                                                                                                                            1 ↵
Installing Cypress (version: 4.6.0)

  ⠋  Downloading Cypress      14% 119s
     Unzipping Cypress      
     Finishing Installation 
```

**Note**

Le module npm est un simple [wrapper](https://docs.cypress.io/guides/getting-started/installing-cypress.html#Installing) autour de Cypress, qui permet de gérer de fixer la version et de simplifier l'intégration avec une CI.

L'installation proprement dite est effectuée par `npx cypress install` dans un dossier hors du repository (ex. [/.cache/Cypress](https://docs.cypress.io/guides/getting-started/installing-cypress.html#Binary-cache) pour Linux)

### Configurer l'environnement

#### Configurer le cache applicatif pour les tests

Vérifiez les valeurs des variables suivantes dans le fichier`/api/.env` (voir le fichier `/api/sample.env`)
- `CYPRESS_LMCS_BASE`
- `CYPRESS_LCMS_API_KEY`

Forcez la mise à jour de ces données dans le cache à la prochaine exécution des tests
```bash
> redis-cli
> FLUSHDB
```

#### Configurer les captures d'écran
Les étapes intermédiaires ne sont pas visualisables par défaut, pour ne pas consommer de la place sur la CI.
C'est ce qu'indique le message : `The snapshot is missing. Displaying current state of the DOM.`

Pour les visualiser en local, à des fins d'analyse
- ouvrir `cypress.json`
- passer la variable `"numTestsKeptInMemory"` de 0 à au nombre de tests à garder
```
  "numTestsKeptInMemory": 1000,
```


### Exécuter les tests

#### Principes

Pour lancer Cypress sur une plateforme complète, il faut lancer
* [x] un cache applicatif
* [x] une base de données Postgres
* [x] l'API, et la connecter à ladite base de données
* [x] le front connecté à ladite API

Pour les détails, voir [section dédiée](../INSTALLATION.md#L42-L42) du guide d'installation Pix

#### Exécuter les tests dans une IHM

###### Lancer l'intégralité de tests

La tâche `cy:run`
- lance l'intégralité des tests dans un navigateur
- affiche le résultat dans la ligne de commande

Note: le navigateur n'est pas headless, les fenêtres seront ouvertes et fermées automatiquement

Syntaxe:
- avec une connexion à la BDD par défaut `postgres@localhost/pix_test`
```
npm run cy:run:local
```
- avec une connexion à la BDD modifiable (ex: sur l'instance `pix_test`)
```
DATABASE_URL=postgresql://postgres@localhost/pix_test npm run cy:run
```

##### Choisir les tests à lancer

La tâche `cy:open` ouvre un navigateur où il est possible de: 
- lancer tout ou partie des tests
- consulter le résultat d'exécution
- afficher les étapes intermédiaires à des fins d'analyse

Syntaxe:
- avec une connexion à la BDD par défaut `postgres@localhost/pix_test`
```
npm run cy:open:local
```
- avec une connexion à la BDD modifiable (ex: sur l'instance `pix_test`)
```
DATABASE_URL=postgresql://postgres@localhost/pix_test npm run cy:open
```

Attention: ne pas committer ces modifications

#### Exécuter les tests en ligne de commande

##### Lancer l'intégralité de tests

Le script
- installe les dépendances des applications, en série
- initialise la BDD 
- démarre les applications, en parallèle
- exécute les tests (environ 15 minutes)

Utile lors
- de la première utilisation, pour vérifier la configuration
- d'un test de non-régression global, par exemple suite à une mise à jour de NodeJS
```
npm run cy:start-run:local:all
```

##### Lancer les tests une application

Le script
- installe les dépendances de l'application
- initialise la BDD
- démarre l'application et l'API
- exécute les tests (environ 5 minutes pour mon-pix)

Utile lors
- d'un test de non-régression sur l'application, par exemple suite au développement d'une feature

Ajouter 

Exécuter l'une des tâches suivantes
```shell
npm run cy:start-run:local:mon-pix
npm run cy:start-run:local:orga
npm run cy:start-run:local:certif
```


### Écrire les tests

#### Tests standard

On utilise
[cypress-cucumber-preprocessor](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor)
pour pouvoir écrire les tests sous la forme de scénarios Cucumber (en langage
"Gherkin").

Pour connaître la liste des mots-clés utilisables, exécuter la commande :

```
npx cucumber-js --i18n-keywords fr
```

La plupart des fonctions natives du navigateur sont accessibles, par exemple l'accès au storage avec `window.localStorage.setItem` 
[Exemple d'utilisation](http://github.com/1024pix/pix/blob/858179613343e238e0f9776374ba4875b688194f/high-level-tests/e2e/cypress/support/commands.js#L5-L5)


#### Tests de non régression visuelle

Il est possible de comparer le rendu d'une page ou d'un élément html lors des tests end-to-end.  

Pour mettre à jour les captures d'écran de base (qui servent de référence pour détecter les régressions), lancer :
```
npm run cy:run:base
```

Pour détecter une régression visuelle dans un test, utiliser le step : 
```
    Alors la page "## nom explicite de la capture d'écran ##" est correctement affichée
```

Pour toutes les options de comparaison / test se référer au plugin utilisé [cypress-visual-regression](https://github.com/mjhea0/cypress-visual-regression). 
