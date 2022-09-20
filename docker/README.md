# stack pix en local avec docker-compose 
## Environnements : 

2 environnements sont proposés :  
- Environnement par défaut : build les container en mode "production". Les instances front sont build et servies par un nginx.
- Dev : les images sont démarrées avec Node afin de permettre le développement local. 

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

Copier le sample.env en .env et rajouter si besoin des valeurs nécessaires

## exemple utilisation Dev : 
> Le démarrage de tous les projets en simmultané utilise beaucoup de ressources réseau car les projets sont build au démarrage.

```sh
docker-compose -f docker-compose.yaml -f docker-compose-dev.yaml build 
docker-compose -f docker-compose.yaml -f docker-compose-dev.yaml up mon-pix
```

## Réinitialisation de la DB : 

```sh
docker-compose exec  api npm run db:reset 
```
