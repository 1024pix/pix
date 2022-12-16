# 35. Image de base docker

Date : 2022-08-24

## État

Accepté

## Contexte

Sur ce projet, nous avons besoin de:

- tester le code applicatif en local et sur la CI en présence d'une base de données et d'un cache applicatif;
- en restant proche de l'environnement de production.

Nous avons donc choisi d'utiliser la technique de conteneurs léger **Docker**.

Deux choix sont possibles quand aux images de base:

- éditeur de l'application;
- PaaS.

### Solution n°1 : Image de base natives

**Description**
Utiliser les images de l'éditeur, par exemple [PostgreSQL](https://hub.docker.com/_/postgres).

**Avantage(s):**

- poids restreint (version alpine)
- disponible en cache dans la CI

**Inconvénient(s):**

- version différente de celle exécuté par le PaaS en production

### Solution n°2 : Image du PaaS

**Description**

Utiliser les images du PaaS, par exemple [Scalingo](https://hub.docker.com/r/scalingo/postgresql).

**Avantage(s):**

- version identique à celle exécutée en production

**Inconvénient(s):**

- dépendance au PaaS, entrainant des spécificités
- image plus lourde (pas de version
  alpine, [fonctionnalités non utilisées](https://github.com/1024pix/pix/pull/4696#issuecomment-1194288809))
- pas disponible en cache dans la CI

## Décision

Nous avons choisi la solution n°1, à savoir l'image de base native, car l'absence de dépendance aux fonctionnalités
spécifiques d'un PaaS est importante.

## Conséquences

Garder l'image native déjà utilisée:

- [local](../docker-compose.yaml)
- [CI](../.circlecli/config.yaml)

