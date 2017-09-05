PIX
===

[![CircleCI](https://circleci.com/gh/sgmap/pix/tree/dev.svg?style=shield&circle-token=:circle-token)](https://circleci.com/gh/sgmap/pix)
[![Coverage Status](https://coveralls.io/repos/github/sgmap/pix/badge.svg)](https://coveralls.io/github/sgmap/pix)
[![Code Climate](https://codeclimate.com/github/sgmap/pix/badges/gpa.svg)](https://codeclimate.com/github/sgmap/pix)

Présentation
------------

[PIX](https://pix.beta.gouv.fr) s’adresse à tous les citoyen•ne•s francophones (élèves, étudiant•e•s, professionnel•le•s, décrocheur•se•s, demandeur•se•s d’emploi, sénior•e•s, citoyen•ne•s) qui souhaitent mesurer, développer et valoriser leurs compétences numériques.

Le service se présente sous la forme d’une plateforme en ligne d’évaluation et de certification des compétences numériques.

Le but de PIX est de susciter l’envie de se former tout au long de la vie en proposant des méthodes d’évaluation innovantes, exigeantes et bienveillantes ainsi que des recommandations de formations ciblées.

Installation
------------

### Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](http://git-scm.com/) (2.6.4)
* [Node.js](http://nodejs.org/) (v8.4.0) et NPM (5.3.0)
* [Bower](http://bower.io/) (1.8.0)
* [Ember CLI](http://ember-cli.com/) (2.15.0)

> Les versions indiquées sont celles préconisées pour un bon fonctionnement de l'application.

### Instructions

**1/ Récupérer le code source**

```bash
$ git clone git@github.com:sgmap/pix.git && cd pix
```

**2/ Lancer le script de configuration de l'environnement**

```bash
$ npm run configure
```

> Pour information, ce script récupère toutes les dépendances des différents modules, exécute les tests (API et Web) et instancie un fichier Dotenv de configuration de l'environnement.

**3/ Configurer les variables d'environnement dans le fichier `pix/api/.env`**

Pour récupérer les différents identifiants / clés de connexion, s'adresser à un membre de [l'équipe PIX](https://github.com/orgs/sgmap/teams/pix).


**4/ Lancer l'application**

```bash
$ npm start
```

**5/ Accéder à l'application**

Par défaut, [l'API](http://localhost:3000) tourne en local sur le port 3000 et [l'application Web cliente](http://localhost:4200) sur le port 4200.

Licence
-------

Ce logiciel et son code source sont distribués sous [licence AGPL](https://www.gnu.org/licenses/why-affero-gpl.fr.html).
