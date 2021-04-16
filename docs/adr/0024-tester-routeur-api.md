# 24. Comment tester le routeur API ?

Date : 2021-04-16

## État
Adopté

## Contexte 

### Général
Nous avons besoin de tests qui :
- empêchent les régressions
- fournissent un feedback rapide (en s'exécutant rapidement)
- ne causent pas de faux positifs lors du refactoring
- soient simples à comprendre, pour être facilement modifiés

Le routeur de l'API (fourni par HAPI) accepte la configuration suivante pour chaque route :
- le nom de la route (path) et son verbe
- une validation syntaxique de la requête (effectué par JOI)
- une validation de sécurité de la requête (authentification)
- le controller à appeler si requête est validée 

Les tests du routeur ont pour but de :  
- tester ces configurations ;
- en satisfaisant les critères (tous ne pouvant être satisfaits en même temps).

### Spécifique

HAPI [préconise](https://hapi.dev/tutorials/testing/) 
- de ne pas faire de tests depuis l'extérieur (appel HTTP)
- mais d'utiliser la fonction `server.inject`

Cette pratique est déjà en place. 
La question à traiter ici est: quel type de serveur démarrer ? 

### Solution n°1 : Utiliser le serveur de production (lourd)
Cette solution utilise le serveur démarré par les [conteneurs](../../api/bin/www), à savoir [server.js](../../api/server.js)

Avantages :
- protège complètement des régressions

Inconvénients :
- feedback moins rapide qu'un serveur léger 
- n'attire pas l'attention du développeur sur les routes en cours de tests

### Solution n°2 : Utiliser un serveur de test (léger)
Cette solution utilise [un serveur](../../api/tests/tooling/http-test-server.js) dédié au test:
- il ne contient pas de route par défaut, elles doivent lui être indiquées
- il contient les stratégies de validation (syntaxique et de sécurité)  
- il ne contient pas tous les plugins (ex: documentation avec Swagger)   

Avantages :
- focalisation du développeur sur la route à tester
- feedback plus rapide qu'un serveur lourd

Inconvénients :
- protège moins des régressions
- ne permet pas de tester les plugins

## Décision
La solution n°2 est adoptée, sauf dans le cas où la fonctionnalité n'est pas offerte 
par le serveur de test léger.

## Conséquences
Ajouter une règle de lint pour prévenir l'utilisation non-intentionelle du serveur lourd.
Créer le serveur léger une seule fois par fichier de test.
