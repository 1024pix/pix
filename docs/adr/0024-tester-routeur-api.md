# 24. Comment tester le routeur API ?

Date : 2021-04-16

## État
Adopté

## Contexte 

### Général
Nous avons besoin de tests qui :
- empêchent les régressions
- fournissent un feedback rapide (s'exécutent rapidement)
- ne causent pas de faux positifs
- soient simples à comprendre, pour être facilement modifiés

Le routeur de l'API (fourni par HAPI) accepte la configuration suivante pour chaque route:
- le nom de la route (path) et son verbe
- une validation syntaxique de la requête (effectué par JOI)
- une validation de sécurité de la requête (authentification)
- le controller à appeler si requête est validée 

Les tests du routeur, c’est-à-dire configuré avec les routes Pix, ont pour but de tester 
ces configurations en satisfaisant les critères (tous ne pouvant être satisfaits en même temps).

### Spécifique

HAPI [préconise](https://hapi.dev/tutorials/testing/) 
- de ne pas faire de tests depuis l'extérieur (appel HTTP)
- mais d'utiliser la fonction `server.inject`

Cette pratique est déjà en place. 
La question à traiter ici est : quel type de serveur démarrer ? 

### Type de test
Le routeur est soumis à deux types de test :
- intégration avec le contrôleur : vérifier que la valeur de retour du handler est renvoyée par le routeur au client
- acceptance : vérifier que le routeur effectue les vérifications, appelle le handler et renvoie la valeur de retour

Le test d'intégration n'a pas besoin que le routeur transmette des valeurs au controlleur, car celui-ci est stubbé pour renvoyer une valeur.
On peut donc se passer des vérifications syntaxiques et de sécurité. 

Dans les tests d'acceptance, les tests utilisent les composants réels (controller, use-case/repository). Comme l'identification du client se 
fait via le token, il n'est pas possible de désactiver l'authentification, sinon le `userId` n'est pas disponible dans `request.auth.credentials`.
De plus, les tests d'acceptance ont pour but premier de prévenir des régressions, ce qui suppose d'utiliser une configuration proche de la production.

**On ne peut donc pas se passer des vérifications syntaxiques et de sécurité.**

### Type de serveurs

#### Serveur de production (lourd)
Appellé [server.js](../../api/server.js), il est démarré en un appel par le [script racine](../../api/bin/www). 

Avantages :
- protège complètement des régressions

Inconvénients :
- feedback moins rapide qu'un serveur léger (démarrage plus lent)
- n'attire pas l'attention du développeur sur les routes en cours de tests

#### Serveur de test (léger) 
Appelé [http-test-server](../../api/tests/tooling/http-test-server.js), il ne contient uniquement instance Hapi sans routes.
Aucun plugin n'est chargé. La route à tester doit lui être indiqué, auquel cas il appliquera la validation syntaxique.

Avantages :
- focalisation du développeur sur la route à tester
- feedback plus rapide qu'un serveur lourd (démarrage plus rapide)

Inconvénients :
- protège moins des régressions (ne permet pas de tester les plugins et la validation de sécurité)

### Solution n°1 : Utiliser un serveur de production (lourd) partout
Avantages :
- protège complètement des régressions
- simplifie le choix pour le développeur

Inconvénients :
- feedback moins rapide qu'un serveur léger
- n'attire pas l'attention du développeur sur les routes en cours de tests

### Solution n°2 : Utiliser un serveur de test (léger) dans les tests d'intégration
Avantages pour les tests d'intégration :
- exécution plus rapide
- facilite l'écriture en permettant de ne pas utiliser de token 

Inconvénients :
- le développeur doit connaître le serveur de test et où l'utiliser

## Décision
La solution n°2 est adoptée, car elle est déjà largement utilisée.

## Conséquences
Ajouter une règle de lint pour indiquer le serveur à utiliser dans les tests d'intégration.
