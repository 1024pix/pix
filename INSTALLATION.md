# Installation

## Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](https://git-scm.com/) (2.6.4)
* [Node.js](https://nodejs.org/) (v12.14.1) et NPM (6.13.4)
* [Docker](https://docs.docker.com/get-started/) (19.03.5) avec [Docker Compose](https://docs.docker.com/compose/install/)

> ⚠️ Les versions indiquées sont celles utilisées et préconisées par l'équipe de développement. Il est possible que l'application fonctionne avec des versions différentes.

Assurez-vous aussi de ne pas avoir de process écoutant le port 5432 (PostgreSQL).

## Instructions

**1.** Récupérer le code source.

```bash
git clone git@github.com:1024pix/pix.git
```

**2.** Se déplacer dans le répertoire projet.

```bash
cd pix
```

**3.** Exécuter le script de configuration de l'environnement de développement (compter entre 10 et 15mn).

```bash
npm run configure
```

> Pix s'appuie sur la bibliotèque [Dotenv](https://github.com/motdotla/dotenv) pour gérer les variables d'environnement en local.

Si besoin, éditer le fichier `.env` généré par le script pour l'adapter à vos besoins.

**4.** Démarrer les applications.

```bash
npm start
```

**5.** Accéder aux applications.

- [Pix API](http://localhost:3000) sur le port 3000
- [Pix App](http://localhost:4200) sur le port 4200
- [Pix Orga](http://localhost:4201) sur le port 4201
- [Pix Admin](http://localhost:4202) sur le port 4202
- [Pix Certif](http://localhost:4203) sur le port 4203
