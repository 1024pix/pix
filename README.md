PIX
===

[![CircleCI](https://circleci.com/gh/sgmap/pix/tree/master.svg?style=svg)](https://circleci.com/gh/sgmap/pix/tree/master) [![Coverage Status](https://coveralls.io/repos/github/sgmap/pix/badge.svg?branch=master)](https://coveralls.io/github/sgmap/pix?branch=master) [![Code Climate](https://codeclimate.com/github/sgmap/pix/badges/gpa.svg)](https://codeclimate.com/github/sgmap/pix) [![Issue Count](https://codeclimate.com/github/sgmap/pix/badges/issue_count.svg)](https://codeclimate.com/github/sgmap/pix)

Présentation
------------

[PIX](https://pix.beta.gouv.fr) s’adresse à tous les citoyen•ne•s français•es (élèves, étudiant•e•s, professionnel•le•s, décrocheur•se•s, demandeur•se•s d’emploi, etc.) qui souhaitent mesurer, développer et valoriser leurs compétences numériques.

Le service se présente sous la forme d’une plateforme en ligne d’évaluation et de certification des compétences numériques.

Le but de PIX est de susciter l’envie de se former tout au long de la vie en proposant des méthodes d’évaluation innovantes, exigeantes et bienveillantes ainsi que des recommandations de formations ciblées.

Installation
------------

### Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](http://git-scm.com/) (2.6.4)
* [Node.js](http://nodejs.org/) (v6.9.0) et NPM (3.10.8)
* [Bower](http://bower.io/) (1.7.9)
* [Ember CLI](http://ember-cli.com/) (2.8.0)
* [PhantomJS](http://phantomjs.org/) (2.1.1)

> Les versions indiquées sont celles préconisées pour un bon fonctionnement de l'application.

### Instructions

```bash
$ git clone git@github.com:sgmap/pix.git && cd pix
$ make install && (cd api && npm run db:migrate && npm run db:seed)
$ make test
$ make serve-api # dans un onglet / terminal dédié à l'API
$ make serve-live # dans un onglet / terminal dédié au client
```

Par défaut, [l'API](http://localhost:3000) tourne en local sur le port 3000 et [l'application cliente](http://localhost:4200) sur le port 4200.

Licence
-------

Ce logiciel et son code source sont distribués sous [licence AGPL](https://www.gnu.org/licenses/why-affero-gpl.fr.html).
