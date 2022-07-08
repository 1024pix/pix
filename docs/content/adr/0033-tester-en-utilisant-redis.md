# 33. Tester en utilisant Redis 

Date : 2022-03-16

## État
Adopté

## Contexte 

Notre architecture de cache repose essentiellement sur Redis. 
Afin d'assurer la connexion à ce dernier, nous utilisons la librairie [node-redis](https://github.com/redis/node-redis) 
qui est enveloppée dans une classe dédiée : `RedisClient`.
Actuellement, cette classe est testée uniquement en local. 

### Difficulté rencontrée

La version 4 de cette librairie introduit [des breaking changes](https://github.com/redis/node-redis/blob/master/CHANGELOG.md#v400---24-nov-2021)
qui auront comme conséquence de complexifier la classe `RedisClient`.

Afin d'assurer le bon fonctionnement de cette partie du code, nous souhaitons mettre en place plus de tests automatisés.   
Au départ, ces derniers n'avaient pas été mis en place pour éviter d'avoir un stockage Redis qui tourne en local. 
Cependant, il est devenu obligatoire au fil du temps. 
L'ajout de ces tests n'impactera donc pas l'expérience des développeurs.

La classe évolue très peu, nous pouvons donc questionner la pertinence du lancement de ces tests à chaque fois dans la CI. 

### Solution n°1 : Ne pas faire évoluer l'existant : tester avec un stockage Redis uniquement en local lorsqu'on le souhaite

#### Avantages

- Gain de temps lors du lancement des tests
- Gain de temps sur la CI 
- Évite de lancer un stockage Redis dans la CI

#### Inconvénients

- Les tests peuvent être oubliés
- Pas de tests de bout en bout avec l'implémentation de production


### Solution n°2 : Tester avec un stockage Redis en local et dans la CI.

#### Avantages

- Pas de risque d'oubli
- La CI lance les mêmes tests qu'en local
- Les tests de bout en bout peuvent utiliser l'implémentation de production

#### Inconvénients

- Les tests peuvent être un peu plus longs

## Décision

La solution n°2 est adoptée, étant la solution apportant le plus de bénéfices.

## Conséquences

Des tests sur la classe `RedisClient` ont été ajoutés. 
