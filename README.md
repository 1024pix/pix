[![CircleCI](https://circleci.com/gh/1024pix/pix/tree/dev.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/1024pix/pix) PIX
===

Présentation
------------

[PIX](https://pix.fr) s’adresse à tous les citoyens francophones (élèves, étudiants, professionnels, décrocheurs, demandeurs d’emploi, séniors, citoyens) qui souhaitent mesurer, développer et valoriser leurs compétences numériques.

Le service se présente sous la forme d’une plateforme en ligne d’évaluation et de certification des compétences numériques.

Le but de PIX est de susciter l’envie de se former tout au long de la vie en proposant des méthodes d’évaluation innovantes, exigeantes et bienveillantes ainsi que des recommandations de formations ciblées.

Installation
------------

### Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](http://git-scm.com/) (2.6.4)
* [Node.js](http://nodejs.org/) (v8.9.4) et NPM (5.5.1)
* [Ember CLI](http://ember-cli.com/) (2.18.0)

⚠️ Les versions indiquées sont celles utilisées et préconisées par l'équipe de développement. Il est possible que l'application fonctionne avec des versions différentes. Cependant nous avons constaté des instabilités avec Node 9+ et NPM 5.6.0.

> Les versions indiquées sont celles préconisées pour un bon fonctionnement de l'application.

### Instructions

**1/ Récupérer le code source**

```bash
$ git clone git@github.com:1024pix/pix.git && cd pix
```

**2/ Lancer le script de configuration de l'environnement**

```bash
$ npm run configure
```

> Pour information, ce script récupère toutes les dépendances des différents modules, exécute les tests (API et Web) et instancie un fichier Dotenv de configuration de l'environnement.

**3/ Configurer les variables d'environnement dans le fichier `pix/api/.env`**

Pour récupérer les différents identifiants / clés de connexion, s'adresser à un membre de [l'équipe PIX](https://github.com/orgs/1024pix/teams/pix).


**4/ Lancer l'application**

```bash
$ npm start
```

**5/ Accéder à l'application**

[l'API](http://localhost:3000) tourne en local sur le port 3000
[l'application Mon-Pix](http://localhost:4200) sur le port 4200.
[l'application Pix-Orga](http://localhost:4201) sur le port 4201.
[l'application Pix-Certif](http://localhost:4203) sur le port 4203.

**6/ Tests de haut niveau**

Dans le répertoire `high-level-tests` se situent les tests de haut niveau.
 À terme, pourront se trouver dans ce répertoire :
  - les [tests de bout en bout](high-level-tests/e2e/README.md) (end-to-end) que l'on utilise comme tests de non-régression au sein du projet ;
  - les tests de montée en charge ;
  - les tests de sécurité.


Licence
-------

Ce logiciel et son code source sont distribués sous [licence AGPL](https://www.gnu.org/licenses/why-affero-gpl.fr.html).
