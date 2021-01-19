# 19. Gérer les scénarios alternatifs dans les use-case API

Date : 2021-01-18

## État

Accepté

## Contexte
Cette ADR décrit la solution déjà en place

### Scénario alternatif
Un use-case API:
- reçoit du controller des données désérialisées (la requête)
- applique les RG métier, si nécessaire avec les repository injectés   
- renvoie au controller des données à sérialiser (la réponse)

Le controller, après sérialisation
- renvoie ces données dans le body
- avec un code HTTP de succès 2xx (200/201) dans les headers  

Cela est valable lors du scénario nominal. 

Qu'en est-il dans les scénarios alternatifs, notamment où la réponse 
- contient des données dans le body
- avec un code HTTP erreur client type 4xx dans les headers ?

Il est important de noter que sont hors-scope:
- les erreurs inattendues (erreur 5xx)
- les validations échouées hors use-case (ex: erreur 400 levée par JOI)

### Besoins

Nous avons besoin:
- d'un caractère explicite de la solution: on doit pouvoir déterminer les scénarios alternatifs pour une route
- de pouvoir renvoyer un code HTTP, en séparant la RG métier de la sérialisation 
- de pouvoir renvoyer un body HTTP, en séparant la RG métier de la sérialisation
- de ne pas confondre les erreurs inattendues et les scénarios alternatifs

### Solutions 

#### Traiter le scénario nominal et alternatif dans le même flux
A la fin du use-case, renvoyer au controller un objet contenant à la fois
- le type de scénario, à mapper par le controller sur un code HTTP 
- les données, que le controller sérialisera

Bilan: 
- caractère explicite de la solution

#### Traiter le scénario alternatif dans un flux d'exception (Error Javascript)
Dans le flux principal du use-case, lorsqu'un scénario alternatif est détecté:
- lever une erreur Javascript (throw), dite erreur du domaine, et y placer les données requises
- mapper cette erreur du domaine sur une erreur dite d'infrastructure, en sérialisant les données dans les propriétés `code` et `meta`
- déléguer le mapping au serveur web plutôt qu'au controller 

Les erreurs du domaine et d'infrastructure peuvent être implémentées en tant qu'instance de classe.
Les classes des erreurs d'infrastructure correspondraient aux erreurs HTTP.
Par exemple, l'erreur HTTP `401` serait nommée `UnauthorizedError` 

Bilan:
- caractère moins explicite de la solution (tout ne figure pas dans le controller)
- mise en avant du scénario nominal

## Décision
Pour mettre en avant le scénario nominal, la solution du flux d'exception est adoptée.

## Conséquences
Continuer à utiliser la solution exposée, déjà en place :
- les erreurs fonctionnelles sont définies dans le domaine `/lib/domain/errors.js`
- les erreurs fonctionnelles sont levées dans les use-case `/lib/domain/usecases`  
- la capture des erreurs (catch) est effectué sur le hook de `preResponse` dans `/lib/application/pre-response-utils.js`
- le mapping des erreurs fonctionnelles est effectué dans `/lib/application/error-manager.js`
- les erreurs d'infrastructure sont définies dans `/lib/application/http-errors.js`

Exemple d'utilisation 
- l'erreur fonctionnelle `UnexpectedUserAccount` est levée dans le use-case `/lib/domain/usecases/authenticate-pole-emploi-user.js`
- elle est mappée vers l'erreur d'infrastructure `ConflictError` (409)
