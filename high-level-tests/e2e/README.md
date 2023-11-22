## Cypress

Cypress est un framework de test end to end (back-end + front-end).
Il est utilisé ici pour les tests de non-régression sur les chemins fonctionnels entiers.

### Je veux lancer les tests rapidement, comment faire ?

Si tu es sous Linux et que tu as `docker` et `docker compose`, alors le plus simple est de lancer à la racine.

    ./scripts/tests-e2e

Pour lancer une session interactive de débugage avec cypress (avec forward de X11):

    ./scripts/tests-e2e open

Si tu n'aimes pas les scripts qui font tout, suit le reste de la procédure.

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

Installer le module npm cypress
```
cd high-level-tests/e2e
npm ci
npx cypress install  
```

Le téléchargment prend quelques minutes
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


### Exécuter les tests

#### Démarrer l'environnement à tester

Pour lancer Cypress sur une plateforme complète, il faut lancer
* [x] un cache applicatif branché sur le Airtable minimal de Cypress,
* [x] une base de données Postgres,
* [x] l'API sur ladite base de données,
* [x] le front connecté à ladite API.
 
Pour les détails, voir [section dédiée](../INSTALLATION.md#L42-L42) du guide d'installation Pix

##### Configurer le cache applicatif pour les tests

- Dans `~/api/.env`, renseignez/décommentez les variables `CYPRESS_LCMS_API_URL` et `CYPRESS_LCMS_API_KEY`. Si vous ne possédez pas ces clefs, je vous invite à demander de l'aide à quelqu'un.

- Nettoyez le cache Redis grâce aux commandes suivantes pour que les données du Airtable minimal soient récupérées au lancement des tests :

```bash
> redis-cli
> FLUSHDB
```

#### Lancer les tests dans Cypress

###### Choisir les tests à lancer

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

Les étapes intermédiaires ne sont pas visualisables par défaut, pour ne pas consommer de la place sur la CI.
C'est ce qu'indique le message : `The snapshot is missing. Displaying current state of the DOM.`

Pour les visualiser en local, à des fins d'analyse, modifier `cypress.json` pour passer la variable `"numTestsKeptInMemory"` de 0 à 1 
```
  "numTestsKeptInMemory": 1,
```

Attention: ne pas committer ces modifications

##### Lancer l'intégralité des tests

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
