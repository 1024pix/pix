## Cypress

Cypress est un framework de test end to end qu'on utilise pour les tests de non régression end to end.

>**Note** : testé et fonctionne avec Chrome 72 et les versions supérieures.
>Le navigateur par défaut de Cypress (Electron 59) échoue à une étape de `wait` (potentiellement en relation avec https://github.com/cypress-io/cypress/issues/2387).

### Lancer Cypress sur Postgres

Pour lancer Cypress sur une plateforme complète, il faut lancer
* [x] une base de données Postgres,
* [x] l'API sur ladite base de données,
* [x] le front connecté à ladite API.

#### Prérequis

Installer et mettre à jour Chrome.

* Lancer Postgres avec docker via le fichier `docker-compose.yml` (`~/pix`)

```
docker-compose up -d
```

* Lancer l'API sur Postgres (`~/pix/api`)

```
DATABASE_URL=postgresql://postgres@localhost/pix_test npm start
```
La variable d'environnement peut également être mise dans le fichier `.env`.


* Lancer le front (`~/pix/mon-pix`)

```
npm start
```

#### Lancer les tests dans Cypress (`~/pix/high-level-tests/e2e`)

Exécuter `npm install` depuis `~/pix/high-level-tests/e2e`

Lancer les tests Cypress dans une interface interactive, sur la même base de donnée que l'API :

```
DATABASE_URL=postgresql://postgres@localhost/pix_test npm run cy:open
```

Vous pouvez aussi lancer à la place : 

```
npm run cy:open:local
```
Ce script va s'occuper de la variable d'environnement pour vous.

On peut également lancer les tests e2e sans l'interface interactive de Cypress, c'est-à-dire avec les résultats en ligne de commande :

```
DATABASE_URL=postgresql://postgres@localhost/pix_test npm run cy:run
```
ou
```
npm run cy:run:local
```

#### Écrire des tests Cypress

On utilise
[cypress-cucumber-preprocessor](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor)
pour pouvoir écrire les tests sous la forme de scénarios Cucumber (en langage
"Gherkin").

Pour connaître la liste des mots-clés utilisables, exécuter la commande :

```
npx cucumber-js --i18n-keywords fr
```

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
