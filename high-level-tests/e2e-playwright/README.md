# e2e tests

## Installation

Installer les dépendances et le browser utilisé par Playwright.

```bash
npm ci
npx playwright install --with-deps chromium
```

> [!NOTE]
> Important : Quand les tests e2e sont exécutés, ils démarrent automatiquement le serveur API et les fronts web.
> Couper vos serveurs locaux afin de ne pas avoir de conflit de port.

## Pré-requis

Vous devez avoir démarré les conteneurs Docker Pix au préalable : `docker compose up` (à la racine du monorepo)

## Exécuter en mode Headless

```bash
npm run test
```

## Exécuter en mode UI

```bash
npm run test:ui
```

## Lancer l'enregistreur d'action

Pour faciliter l'écriture des tests, Playwright propose un utilitaire pour logger les actions utilisateur et générer un scénario :

```bash
npx playwright codegen
```

## Concernant cette suite de tests

### Données

Les tests de cette suite sont exécutés sans nettoyage post-exécution de la base de données.
Pour chaque test, il faut adopter alors une des approches suivantes :
- Le test comprend la réalisation de l'ensemble des actions permettant de créer les données suffisantes pour ce qu'on souhaite tester
  sans reposer sur les données d'autres tests.
- Si ça rend le test trop lent, envisager des écritures directement en BDD, mais alors interdiction de fixer les IDs des entités insérées !

**IMPORTANT**: Ne pas se baser sur les données créées par un test voisin !

### Parallélisme

Si les conditions dans la section du dessus sont respectées, les tests devraient a priori pouvoir être exécutés parallèlement.
Il existe cependant des tests qu'on souhaite exécuter de façon séquentielle.
En local, Playwright est configuré sur 1 worker : de fait, l'exécution séquentielle de tous les tests est forcée.
Sur la CI en revanche, nous retrouvons deux jobs pour l'exécution des tests Playwright, qui grosso modo font ceci :

```shell
#cmd1, parallélisme activé
npx playwright test --grep-invert @runSerially --shard=1/3

#cmd2, exécution séquentielle
npx playwright test --grep @runSerially --workers=1
```
Si vous souhaitez que votre test soit exécuté séquentiellement, ajoutez le tag `@runSerially` dans le nom de votre test comme ceci :

```js
test('[@runSerially] this test needs to be run serially', async () => { /* test code */ });
```
On invite également à documenter la raison pour laquelle le tag a été apposé. Pour ce faire :

```js
test('[@runSerially] this test needs to be run serially', async ({}, testInfo) => {
  testInfo.annotations.push(
    {
      type: 'tag',
      description: `@snapshot - <insert explanation on why tag in necessary>`,
    },
  );
  /* test code */
});
```

### Snapshot testing

Certains tests sont des tests de snapshot, c'est-à-dire que, sur la base d'un jeu de données de référence (le snapshot), ils s'exécutent
et font des assertions.
Dans notre cas, ces tests doivent donc pouvoir ou bien jouer le scénario pour écrire le snapshot, ou bien jouer le scénario avec des assertions sur le contenu du snapshot.

Si vous souhaitez faire un test de snapshot :
- Utilisez le SnapshotHandler (intégré aux fixtures) pour gérer la construction, la sauvegarde et/ou l'évaluation du snapshot
- Ajoutez le tag `@snapshot` avec une annotation pour documenter. On peut notamment documenter les raisons valides pour lesquelles un snapshot
  produirait tout à coup un test rouge
```js
test('[@snapshot] this is a snapshot test', async ({ snapshotHandler }, testInfo) => {
  testInfo.annotations.push(
    {
      type: 'tag',
      description: `@snapshot - <insert explanation on why snapshot could produce a red test>`,
    },
  );
  /* some code */
  snapshotHandler.push('a label to explain the value i am expecting', 123);
  /* some more code */
  await snapshotHandler.expectOrRecord('my-snapshot-filename.json');
});
```

Ainsi, le test est exécuté dans un mode ou l'autre en fonction d'une variable d'env :
```shell
# enregistrement de snapshot
npm run test:snapshot

# vérification du snapshot
npx playwright test --grep @snapshot
```

_Remarques :_
- Les snapshots doivent être générés en local, la CI ne doit faire que de la vérification de snapshot
- Pensez à forcer l'ajout du snapshot via git si votre snapshot est un .json (cette extension de fichier est dans le .gitignore du dépôt).
  Utilisez `git add -f mon.json`

### Enregistrement de fichiers .har

Pour faire un dump des fichiers .har sur la base de l'exécution des tests, ajoutez la variable d'env. :
```shell
RECORD_HAR=true npx playwright test
```

