## Introduction
Ce document rassemble les pratiques constatées et faisant consensus, afin de faciliter le développement, et notamment les revues de code.
Son but n'est pas d'imposer une pratique, mais de capitaliser les bonnes pratiques. 

Favoriser dans ce document :  
- la motivation des choix 
- l'utilisation d'exemples

## Généralités

### Vocabulaire ###
Ici:
* **objet** ne fait pas référence à la programmation orientée objet
* **composant** ne fait pas référence au composant Ember. 

Ce sont des synonymes pour ce qui est en train d'être testé (anglais : [SUT](https://en.wikipedia.org/wiki/System_under_test))

Les objets utilisés afin de tester de manière isolée sont appelés doublures (anglais: [test double](https://martinfowler.com/bliki/TestDouble.html)).
Ils regroupent les mocks, stubs, spy, fake, dummy.
 
### Types de test ###

| Type de test  | Abbr | Anglais      | Ce qui est vérifié|
| ------------- |------| -------------|-------------------|
| unitaire      | TU   | unit         | le comportement d'une unité de code (fonction ou d'une méthode) de manière isolée (ex : pas d'appel BDD)|
| intégration   | TI   | integration  | le résultat de l'interaction de N unités de code (composants) dans une configuration proche de celle de production (ex : BDD, Redis, Nock ) |
| acceptation   | TA   | acceptance   | le fonctionnement d'une application (ex: Pix App, Pix API) en limitant les doublures à ce qu'on ne  maîtrise pas (ex: Airtable)|
| bout-en-bout  | E2E  | end to end   | le fonctionnement de la plateforme (traverser toutes les couches front et back) |

Les tests d'intégration, d'acceptation et bout-en-bout vérifient l'interaction de composants à des niveaux de plus en plus élevés, le dernier étant le Système d'Information complet.

Les avantages/inconvénients de chaque type de test et la répartition de ceux-ci sont décrits par la [pyramide des tests](https://martinfowler.com/bliki/TestPyramid.html) 
 
### Frontières de test ###
Ne pas tester les dépendances sortant du dépôt Git concerné (ex: depuis le dépôt pix, ne pas tester pix-ui ou mocha).
Ces librairies ou framework sont choisies de telle manière à ce que l'on puisse avoir confiance en elles, elles font l'objets de tests dans leur propre dépôt.
En revanche, tester l'intégration de ces dépendances dans le code, notamment des wrappers.

## Back - API

### Type de test par objet ###

| Conteneur      | Objet                  | Type de test  |
| ---------------|------------------------|---------------|
| application    | route                  | intégration   |
|     | controller             | unitaire      |
|________________|________________________|_______________|
| domain         | events                 | unitaire      |
|                | models                 | unitaire      |
|                | read-model             | unitaire      |
|                | service                | unitaire      |
|                | use-case               | unitaire ?    |
|                | use-case               | intégration ? |
|                | validator              | intégration   |
|________________|________________________|_______________|
| infrastructure | repository             | intégration   |
|                | serializer             | unitaire      |
|                | _wrapper_              | intégration   |
|                | autres                  | unitaire      |

_wrapper_ : tout composant qui encapsule une dépendance ou une API
* MailJetProvider.js
* SendinblueProvider.js
* airtable.js
* RedisClient.js



Exemple :
```javascript
it('should add a row in the table "organizations"', async () => {
      // given
      const nbOrganizationsBeforeCreation = await BookshelfOrganization.count();

      // when
      await organizationRepository.create(domainBuilder.buildOrganization());

      // then
      const nbOrganizationsAfterCreation = await BookshelfOrganization.count();
      expect(nbOrganizationsAfterCreation).to.equal(nbOrganizationsBeforeCreation + 1);
    });
```

### Unitaire
Exemple:
* use-case [ici](https://github.com/1024pix/pix/blob/prod/api/tests/unit/domain/usecases/update-expired-password_test.js)
* composant avec un service, non stubbé [ici](https://github.com/1024pix/pix/blob/prod/api/tests/unit/domain/models/CampaignTubeRecommendation_test.js)

### Intégration
L'utilisation de Bookshelf, Knex, Nock pour faire des assertions est autorisé.
Exemple:
* entre HAPI et configuration de la route [ici](https://github.com/1024pix/pix/blob/prod/api/tests/integration/application/passwords/index_test.js)

### Acceptation
Exemple:
* sur l'application : [ici](https://github.com/1024pix/pix/blob/prod/api/tests/acceptance/application/password-controller_test.js)

## Front

### Généralités
Conforme aux [préconisations Ember](https://guides.emberjs.com/release/testing/test-types/)

### Type de test par composant ###

| Objet         | Type de test  |
| ------------- |---------------|
| route         | unitaire      |
| route         | acceptation   |
| controller    | unitaire      |
| component     | intégration   |
|               | (rendering)   |
| model         | unitaire      |
| serializer    | unitaire      |
| adapter       | unitaire      |
| helper        | unitaire      |
| authenticator | unitaire      |

### Tracked properties
Elles sont testées unitairement, peu importe leur nature (component, controller, route)

## Bout-en-bout 
Raison: éviter les tests manuels, longs et répétitifs, de non-régression
