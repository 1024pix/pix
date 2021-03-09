# Installation

## Prérequis

Vous devez au préalable avoir correctement installé les logiciels suivants :

* [Git](https://git-scm.com/) (2.6.4)
* [Node.js](https://nodejs.org/) (v14.16.0) et NPM (6.14.11)
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

**2.1** ⚠️ Sous Windows seulement

Il se peut que la dernière version `windows-build-tools` ne s'installe pas sur votre machine. La `windows-build-tools@4.0.0` semble plus stable à l'installation.
```bash
npm install windows-build-tools
```
Ensuite, il faudra définir dans `.npmrc` quelle est l'invite de commande à utiliser pour lancer les script-shell. Par défaut, c'est le `cmd.exe` pour changer cela :

* installation 64bit :
```bash 
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```
* ou 
```bash
npm config set script-shell "C:\\Program Files (x86)\\git\\bin\\bash.exe"
```
Votre windows devrait être prêt pour l'instanciation du projet Pix.

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
