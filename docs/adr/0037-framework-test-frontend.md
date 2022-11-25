# 37. Choisir un framework de test front-end

Date : 2022-11-25

## État

Accepté

## Contexte

Les frameworks de test incluent:

- un test runner;
- une librairie d'action: cliquer sur un bouton, naviguer vers une URL;
- une librairie d'assertions.

Sur ce projet, nous avons besoin de tester de manière automatisée le code du front-end:

- de manière expressive: le test dit clairement ce qu'il attend;
- simplement: apprendre un nouveau langage d'assertion est coûteux;
- avec fiabilité: les nouvelles versions du framework doivent être disponibles régulièrement et installables facilement.

Ember fournit, et il n'est pas possible de s'en passer :

- un test-runner bas-niveau: `testem`;
- une IHM web pour lancer les tests, suivre leur avancement, faire du debug;
- une libraire d'actions : `@ember/test-helpers`.

Il est en revanche possible de connecter deux tests-runner:

- QUnit, qui contient sa propre librairie d'assertion (par défaut);
- Mocha, avec la librairie d'assertion chai (en utilisant un plugin).

### Solution n°1 : Utiliser le framework Mocha/Chai

**Description**

Mocha est un test-runner répandu en testing backend et frontend.
Chai est une librairie d'assertion répandu en testing backend et frontend.

**Avantage(s):**

- connu des développeurs en dehors de chez Pix: favorise l'intégration à l'arrivée
- connu des développeurs Pix, car utilisé dans l'API
- expressivité:
  - classique `assert.deepEqual(foo, bar);`
  - TDD `expect(foo).to.deep.equal(bar);`
  - BDD `foo.should.deep.equal(bar);`
- intégrable à d'autres librairies de tests (ex: mocking, http) grâce à des plugins
  - promesses avec `chai-as-promised`: `myFunction().should.eventually.equal("foo")`
  - mocking: `expect(myMock).to.have.been.calledOnceWithExactly(myObject);`

**Inconvénient(s):**

Il n'est pas le framework préconisé par Ember, donc non maintenu par la core Team Ember:

- peu d'ajout de fonctionnalités;
- peu de bugfix, dont fix de sécurité ou de support des nouvelles versions d'Ember.

En particulier, la version 4 d'Ember n'est pas compatible avec Mocha car elle n'utilise pas une version compatible
des `@ember/test-helpers` ([RFC](https://github.com/emberjs/rfcs/pull/858/))

Cela est un argument décisif, car nous avons besoin de monter les versions d'Ember.

### Solution n°2 : Utiliser le framework QUnit

**Description**

QUnit est un test-runner assez peu répandu en testing backend et frontend.

**Avantage(s):**

Framework préconisé par Ember, maintenu par la core Team Ember:

- ajout régulier de fonctionnalités;
- bugfix, dont fix de sécurité ou de support des nouvelles versions d'Ember, réguliers.

**Inconvénient(s):**

Framework peu répandu en dehors d'Ember:

- apprentissage d'une nouvelle syntaxe, notamment pour les assertions;
- moins d'expressivité avec seule la syntaxe classique disponible`assert.deepEqual(foo, bar);`;
- peu d'intégration aux outils de test;
  - mocking avec `sinon-chai` : `assert.ok(myMock.calledOnceWith(myObject));`

## Décision

Nous avons choisi la solution n°2, à savoir QUnit, car la montée de version Ember est plus importante.

## Conséquences

Ceci étant une rétro-ADR, seul un des front-end utilisait Mocha, les autres utilisaient QUnit.
La migration Mocha => QUnit a déjà effectuée via des codemdods.
Voir [PR](https://github.com/1024pix/pix/pull/5258) pour plus de détails.

