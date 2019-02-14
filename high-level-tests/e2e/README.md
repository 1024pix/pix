## Cypress

Cypress est un framework de test end to end qu'on utilise pour les tests de non régression end to end.

Pour l'instant, l'utilisation de Cypress fonctionne **uniquement sur un poste de développeur**.

>**Note** : testé et fonctionne avec Chrome 72.
>Le navigateur par défaut de Cypress (Electron 59) échoue à une étape de `wait` (potentiellement en relation avec https://github.com/cypress-io/cypress/issues/2387).

### Lancer Cypress sur Postgres

Pour lancer Cypress sur une plateforme complète, il faut lancer
* [x] une base de données Postgres,
* [x] l'API sur ladite base de données,
* [x] le front connecté à ladite API.

#### Prérequis

Installer et mettre à jour Chrome.

Lancer Postgres avec docker (`~/pix`)

```
docker run --rm --name pix-db-e2e -e POSTGRES_DB=pix_test -dit -p 5433:5432 postgres
```

Lancer l'API sur Postgres (`~/pix/api`)

```
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5433/pix_test npm start
```

Lancer le front (`~/pix/mon-pix`)

```
npm start
```

#### Lancer les tests dans Cypress (`~/pix/high-level-tests/e2e`)

Exécuter `npm install` depuis `~/pix/high-level-tests/e2e`

Lancer les tests Cypress dans une interface interactive, sur la même base de donnée que l'API :

```
DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/pix_test npm run cy:open
```
