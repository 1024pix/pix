# 1. Tracer les erreurs dans un contexte HTTP

Date : 2022-10-18

## État

Accepté

## Contexte

Sur ce projet, nous avons besoin de :

- détecter les situations imprévues par le code (en général, une levée d'erreur Javascript hors du domaine);
- disposer de toutes les informations sur le contexte (symptômes, en général, le contenu de l'erreur Javascript
  sérialisé);
- déterminer la requête HTTP sur laquelle cette situation imprévue s'est produite.

La requête HTTP n'est pas identifiée par la signature HTTP (ex: `GET /api/users/123`).

Elle est identifiée par un identifiant technique assigné à chaque requête,
nommé [`X-Request-ID`](https://doc.scalingo.com/platform/app/x-request-id) et positionné par le
PaaS, actuellement Scalingo, dans le header de la requête.

Dans la suite de l'ADR, on l'appellera `correlationId`.

L'architecture basique de HapiJs ne permet pas d'accéder à cette propriété lorsque la situation imprévue se produit.

### Solution n°1 : Rapprocher manuellement les appels HTTP et les évènements d'erreurs

**Description**
Il est parfois possible de rapprocher manuellement des deux évènements.

Si une seule signature HTTP (ex: `GET /api/users/123`) est présente sur le conteneur au moment de l'erreur, on sait
qu'elles sont liées.

L'IP, si elle discriminante entre deux occurrences de la même signature, peut aussi le permettre.

**Avantage(s):**

- pas de modification du code existant

**Inconvénient(s):**

- le rapprochement manuel est fastidieux, et fait par le développeur
- il n'y a pas de garantie qu'il n'y ait qu'une seule signature HTTP en même temps:
  - l'augmentation du traffic rend probable la co-existence de deux requêtes ayant la même signature
  - la conception des routes rend la signature moins discriminante (ex: `POST /api/answers`)
- l'IP peut être identique entre plusieurs postes utilisateur (infrastructures réseaux)

### Solution n°2 : Rapprocher automatiquement les appels HTTP et les évènements d'erreurs

**Description**

Utiliser la fonctionnalité de [async_hooks](https://nodejs.org/api/async_hooks.html) pour ajouter le `correlationId` aux
messages d'erreur.
> The node:async_hooks module provides an API to track asynchronous resources.


**Avantage(s):**

- garantie de pouvoir corréler les deux évènements

**Inconvénient(s):**

- modification du code existant

## Décision

Nous avons choisi la solution n°2, à savoir le rapprochement automatique, car le rapprochement manuel est trop
fastidieux.

Une tentative dans ce sens a été effectuée dans la [PR](https://github.com/1024pix/pix/pull/3352) du 23 août 2021.

Cet ADR valide cette tentative et élargit son périmètre.

## Conséquences

### Création d'un composant

Faciliter l'usage de `async_hooks` en le centralisant dans le composant `monitoringTools.log<LEVEL>`

Usage:

```js
monitoringTools.logError({
  metrics: { responseTime },
  message: `POST request to ${url} failed`
});
```

Ne pas le placer sous feature toggle, car cette fonctionnalité est essentielle.

### Utilisation dans les erreurs non prévues

Utiliser `monitoringTools.log<LEVEL>` dans le cas d'erreurs non prévues (levées par une librairie, pas par le code
applicatif).

Pour cela :

- suppression de la fonctionnalité de log d'erreur du plugin `hapi-pino`
- prise en compte dans le composant dédié à la gestion des erreurs prévues `pre-response-handler` (hook
  de `pre-response`).

### Autres usages

Pas de reprise du code existant, déjà globalement conforme.

Pour le code existant non conforme, ajout de clauses d'exclusion renvoyant à cet ADR.

Prévenir des futures introductions involontaires par l'usage d'une règle de lint renvoyant à cet ADR.
