# 28. Remplacer l'usage de l'ORM BookshelfJS par le query-builder KnexJS

Date : 2021-06-29

## État

Accepté

## Contexte

### Choix initial de l'ORM BookshelfJS comme outil d'interaction avec la base de données

Dans l'intention louable de produire et livrer rapidement, l'utilisation d'un ORM, **BookshelfJS**, a été adoptée afin de gérer les interactions dans l'API avec la base de données **PostgreSQL**.
Les ORMs sont des bibliothèques qui permettent de communiquer avec une base de données en offrant la possibilité de mettre en évidence des objets, et des relations entre eux, qui vont venir se calquer au schéma d'une base de données.
Ces avantages sont très intéressants sur le papier et réels dans les premiers temps d'un projet, mais à mesure que celui-ci grandit et que les problématiques qu'il adresse deviennent pointues, ils laissent la place à des écueils et autres inconvénients que nous rencontrons désormais :

- Apporter de l'abstraction vis à vis des détails techniques d'interaction avec la BDD. La promesse des ORMs est que le code produit sera compatible quel que soit le système de base de données relationnelles (**MySQL**, **PostgreSQL**, **SQLite**, etc...).
- Alléger la charge mentale du développeur en ne lui imposant plus une connaissance fine du langage SQL.
- Facilement déclarer et requêter sur des objets du domaine lesquels sont parfois stockés de façon complexe en BDD (multi-tables, relations étrangères, etc...).
- Améliorer la lisibilité des interactions avec la BDD en faisant en sorte d'intéragir avec des entités métiers.

Les avantages sont très intéressants sur le papier, mais en réalité cela s'avère être un peu plus compliqué.

### Les difficultés rencontrées aujourd'hui

Aujourd'hui, la plateforme **Pix** doit gérer tous les jours un nombre important de requêtes utilisateurs, et donc doit gérer un nombre tout aussi important d'interactions avec la BDD.
A la fois du point de vue des performances mais aussi du quotidien du développeur, **BookshelfJS** présente de plus en plus d'inconvénients, qui sont en fait connus des ORMs et qui constituent leurs limites.

- Afin de tenir leurs promesses, les ORMs sont en réalité des bibliothèques complexes avec une interface riche. Il s'avère finalement que la montée en compétence sur l'usage de l'outil (et la maintenance du code associé) n'est pas si évidente.
- Les ORMs, à partir du code produit en utilisant leur bibliothèque, génèrent automatiquement les requêtes SQL associées. Pour des requêtes simples sur des objets simples de type CRUD, le SQL généré est plutôt efficace. Malheureusement, dès lors que l'on souhaite réaliser des opérations un peu plus complexes, cela devient vite une lutte avec la bibliothèque. De plus, souvent, celle-ci va générer un SQL pas toujours performant.

```js
// Exemple inspiré de code existant de récupération
// d'un assessment-result avec ses competence-marks
const assessmentResultBookshelf = await BookshelfAssessmentResult.where({
  id: 123,
}).fetch({ withRelated: ["competenceMarks"] });
```

```sql
# SQL généré
SELECT "assessment-results".* FROM "assessment-results" WHERE "id" = $1 LIMIT $2; (bindings : {123, 1})
SELECT DISTINCT "competence-marks".* FROM "competence-marks" WHERE "competence-marks"."assessmentResultId" IN ($1); (bindings : {123})
```

On constate que :

1. Deux requêtes sont générées alors que cela pourrait être réalisé en une seule, et celles-ci sont exécutées à chaque fois dans une transaction BDD différente (donc une connexion BDD à renouveler).
2. La syntaxe est destinée à fonctionner pour tellement de cas différents qu'elle est trop générique et peut ralentir la requête (ici le `DISTINCT` n'est pas nécessaire par exemple).

- La promesse d'abstraction ORM est trompeuse à plusieurs titres : d'une part, le développeur n'apprend pas le SQL (langage largement utilisé) mais apprend à la place à apprivoiser une interface ORM complexe qui n'est que très peu commune
  avec les autres ORMs. D'autre part, le développeur est fin de compte tenu de comprendre un peu le SQL pour débugger et optimiser.

Aussi l'on doit admettre que l'usage qu'on fait de **BookshelfJS** dans la base de code est loin de l'usage classique que l'on ferait d'un ORM.
L'idée initiale est de représenter les données de la base de données et les relations qu'elles entretiennent entre elles par des objets dans le code.

Ainsi, on pourrait les manipuler comme si nous manipulions des objets du domaine, mais aussi effectuer simplement et de façon très abstraite les opérations de persistance ou de rollback.
Dans les faits, nous avons en fait nos propres objets du domaine (`api/lib/domain/models` VS `api/lib/infrastructure/orm-models`). Pire, la durée de vie des modèles BookshelfJS instanciés suite à récupération de données dans la base de données
est très courte.

Extrait légèrement modifié du fichier `campaign-repository.js`G :

```js
const bookshelfCampaign = await BookshelfCampaign.where({ id }).fetch();
return bookshelfToDomainConverter.buildDomainObject(
  BookshelfCampaign,
  bookshelfCampaign
);
```

Il est très clair que l'instance **BookshelfJS** du modèle campagne (`bookshelfCampaign`) a une durée de vie très courte et est presque immédiatement délaissée au profit de sa conversion
en objet de notre domaine.

Le problème en soi n'est pas réellement d'avoir une structure de données intermédiaire entre la sortie des données de la BDD et la transformation en objet du domaine. Cette transition est incontournable.
Le problème est que la structure de données intermédiaire (en l'occurrence ici les modèles **BookshelfJS**) est une structure complexe et lourde proposant une interface riche et inexploitée.

Pour mieux comprendre, comparons l'occupation mémoire d'une donnée récupérée via un query-builder simple (ici **KnexJS**) VS l'ORM **BookshelfJS**.
Voici les chiffres pour 1500 récupérations d'un enregistrement de la table `sessions` ([article Confluence](https://1024pix.atlassian.net/wiki/spaces/DEV/pages/1401094177/2020-04-28+Comprendre+et+analyser+la+consommation+en+m+moire+de+notre+API#Comparatif-Bookshelf-VS-Knex)):

- **KnexJS** : 47MB
- **BookshelfJS**: 127MB

## Décisions

Vu les difficultés posées par l'utilisation de l'ORM, on trouve d'ores et déjà dans le code de multiples utilisations du query-builder **KnexJS** en lieu et place de **BookshelfJS**.

Cette ADR propose d'officialiser ce choix selon l'application suivante :

- Rendre obligatoire l'usage de **KnexJS** pour les développements futurs
- Encourager au refactoring au fil de l'eau du code existant

Pour aider les développeurs à faire le changement, nous proposons [une Pull Request](https://github.com/1024pix/pix/pull/3109) qui met en place ce changement dans le `answer-repository`.

## Conséquences

Responsabilité des développeurs et des équipes sur :

- Les nouveaux développements doivent, autant que faire se peut, utiliser KnexJS pour interroger la base de données
- Les équipes sont encouragées fortement à prendre du temps, à l'occasion des tickets ou de diverses tâches techniques, de procéder au changement dans le code existant

Ne pas hésiter à se faire aider sur ce sujet par les personnes compétentes.

Les conséquences positives qu'on espère constater :

- Une réduction de la charge mémoire moyenne sur les containers API
- Une homogénéisation du code dans l'usage globalisé de **KnexJS**
- Une meilleure maîtrise des requêtes SQL formulées à la BDD
- Une montée en compétence des développeurs sur le SQL
- Une occasion de refacto sur des repositories un peu vieux !
