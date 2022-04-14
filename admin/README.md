# Pix Admin

Interface d'administration pour les membres de Pix.   

## Prérequis

Vous devez avoir correctement installé les programmes suivants :

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) (with npm)
* [Ember CLI](https://ember-cli.com/)
* [Google Chrome](https://google.com/chrome/)

## Installation

```bash
$ git clone git@github.com:1024pix/pix.git
$ cd pix/admin
$ npm install
```

## Développement

> Vous devez au préalable avoir une instance de [Pix API](https://github.com/1024pix/pix/tree/dev/api) qui tourne à l'URL : [http://localhost:3000](http://localhost:3000).

```bash
$ npm run dev
```

Accédez à l'application locale via l'URL : [http://localhost:4202](http://localhost:4202).

## Intégration

L'application est automatiquement déployée sur l'environnement d'intégration dès qu'un commit est poussé sur la branche `dev`.

Accédez à l'application d'intégration via l'URL : [https://integration.admin.pix.fr](https://integration.admin.pix.fr).


## Production

L'application est automatiquement déployée sur l'environnement de production dès qu'un commit est poussé sur la branche `dev`.

Accédez à l'application de production via l'URL : [https://admin.pix.fr](https://admin.pix.fr).
