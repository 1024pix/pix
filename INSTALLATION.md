# Installation

## Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](https://git-scm.com/) (2.6.4)
* [Node.js](https://nodejs.org/) (v12.14.1) et NPM (6.13.4)
* [Docker](https://docs.docker.com/get-started/) (19.03.5) avec [Docker Compose](https://docs.docker.com/compose/install/)

> ⚠️ Les versions indiquées sont celles utilisées et préconisées par l'équipe de développement. Il est possible que l'application fonctionne avec des versions différentes.

## Instructions

**1.** Récupérer le code source.

```bash
git clone git@github.com:1024pix/pix.git
```

**2.** Se déplacer dans le répertoire projet.

```bash
cd pix
```

**3.** Définir les variables d'environnement.

Dans le répertoire `/api`, copier le fichier `sample.env` et le nommer `.env`.

> Pix s'appuie sur la bibliotèque [Dotenv](https://github.com/motdotla/dotenv) pour gérer les variables d'environnement en local.

```bash
cp api/sample.env api/.env
```

Éditer le fichier `.env` ainsi obtenu pour renseigner les valeurs des différents paramètres.

**4.** Installer les dépendances.

````bash
npm install
````

**5.** Démarrer PostgreSQL et Redis grâce à la stack Docker Compose.

> Pix utilise Docker en local afin de disposer d'un environnement au plus proche de celui de production.

```bash
docker-compose up -d
```

**6.** Exécuter les tests automatisés.

```bash
npm test
```

**7.** Configurer et alimenter la base de données avec des données de test.

```bash
(cd api && npm run db:reset)
```

**8.** Démarrer les applications.

```bash
npm start
```

**9.** Accéder aux applications.

- [Pix API](http://localhost:3000) sur le port 3000
- [Pix App](http://localhost:4200) sur le port 4200
- [Pix Orga](http://localhost:4201) sur le port 4201
- [Pix Admin](http://localhost:4202) sur le port 4202
- [Pix Certif](http://localhost:4203) sur le port 4203
