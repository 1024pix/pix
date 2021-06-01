# 25. Comment journaliser dans l'API ?

Date : 2021-06-01

## État
Adopté

## Contexte 

Nous avons besoin journaliser certaines informations dans l'API:
- requêtes HTTP;
- informations de diagnostic dans les routes;
- informations de diagnostic dans les scripts (non déclenchés par requête http).

Ces informations doivent être persistées sur le système de fichiers du conteneur.
Elles seront ensuite regroupées dans un service dédié (ex: Datadog).

### Solution n°1 : Utiliser le composant de journalisation HAPI
HAPI propose un composant [natif](https://hapi.dev/tutorials/logging/?lang=en_US#methods):
- `request.log()`;
- `server.log()`.

Celui-ci, une fois configuré via plugin [ex: good](https://www.npmjs.com/package/@hapi/good),
permet d'écrire dans lse système de fichiers via la sortie standard.

Voilà [une implémentation](../api/lib/plugins.js)

Avantages :
- pas de dépendance externe.

Inconvénients :
- ne prend pas en compte les scripts (pas de serveur HAPI démarré).
- le plugin peut ne pas offrir les fonctionnalités demandées

### Solution n°2 : Utiliser une librairie de journalisation

Une [librairie de journalisation](api/lib/infrastructure/logger.js) peut être utilisée. 
Elle devra être injectée ou importée à [chaque utilisation](api/bin/www).
```javascript
const logger = require('../lib/infrastructure/logger');
//(...)
logger.info('Server running at %s', server.info.uri);
```

Il est possible de journaliser les requêtes http en s'abonnant aux évènements émis par HAPI, 
par exemple [response](https://hapi.dev/api/#-response-event).

Avantages :
- prend en compte tous les cas d'usage;
- connaissance plus répandue parmi les développeurs (non lié à HAPI).
 
Inconvénients :
- utilisation d'une dépendance.

## Décision

La solution adoptée est la solution n°2.

Néanmoins, la solution n°1 avait déjà été implémentée pour les requêtes http.
Comme il n'y a pas nécessité identifiée de changement, alors la solution 1 est
maintenue sur ce périmètre.

Résumé:
- requêtes http: plugin HAPI;
- diagnostic et scripts: librairie.

## Conséquences
Les routes REST sont en anglais (URL, nom des paramètres).
En conséquences, les messages de journalisation seront également en anglais.
