# stack pix en local avec docker-compose 
## Environnements : 

2 environnements sont proposés :  
- Environnement par défaut : build les container en mode "production". Les instances front sont build et servies par un nginx.
- Dev : les containers sont démarrés avec Node afin de permettre le développement local. 

Les environnements sont disponible grace au multi-stage Dockerfile.
https://docs.docker.com/develop/develop-images/multistage-build/

L'utilisation de plusieurs environnements et fichiers docker-compose : 
https://docs.docker.com/compose/extends/

## Utilisation non dev : 
```sh
docker-compose build
docker-compose up -d 
```

## Utilisation du .env : 

Copier le `sample.env` en `development.env` et rajouter si besoin des valeurs nécessaires

## exemple utilisation Dev d'API : 

```sh
docker-compose -f docker-compose.yaml -f docker-compose-dev-api.yaml build 
docker-compose -f docker-compose.yaml -f docker-compose-dev-api.yaml up -d 
```

## exemple utilisation Dev Frontend : 
> Le démarrage de tous les projets frontend en simmultané utilise beaucoup de ressources réseau car les projets sont build au démarrage.

Pour coder sur pix-orga : 

```sh

docker-compose -f docker-compose.yaml -f docker-compose-dev-front.yaml build orga
docker-compose -f docker-compose.yaml -f docker-compose-dev-front.yaml up -d orga
```

## Dev API + frontend : 
docker-compose -f docker-compose.yaml -f docker-compose-dev-api.yaml -f docker-compose-dev-front.yaml build api orga
docker-compose -f docker-compose.yaml -f docker-compose-dev-api.yaml -f docker-compose-dev-front.yaml up -d api orga


## Réinitialisation de la DB : 

```sh
docker-compose exec  api npm run db:reset 
```

## Simplifier l'utilisation à l'aide d'un alias : 

```sh
alias dcapi="docker-compose -f docker-compose.yaml -f docker-compose-dev-api.yaml"
alias dcfront="docker-compose -f docker-compose.yaml -f docker-compose-dev-front.yaml"
alias dcall="docker-compose -f docker-compose.yaml -f docker-compose-dev-api.yaml -f docker-compose-dev-front.yaml"
```

## Node_modules : 

Dans l'environnement de dev, les node_modules sont stockés dans un volumes dédié et ne sont pas dans le dossier de travail afin d'ignorer les possibles modifications / différences entre l'environement local et docker.

En cas de problème et afin de repartir à zéro sur les node_modules, supprimez le volume : 
`docker volume rm <VOLUME_NAME>` (voir fichier docker-compose front dev)


## Rappel des URLs en local: 

API : http://localhost:3000
mon-pix : http://localhost:4200
Orga : http://localhost:4201
Admin : http://localhost:4202
Certif : http://localhost:4203
