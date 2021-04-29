# 23. Faut-il encapsuler les appels http dans l'API ?

Date : 2020-04-22

## État
Adopté

## Contexte 
L'API effectue des appels http:
- vers des services Pix (ex: LCMS);
- vers des API externes à Pix (ex: Pole Emploi).

La librairie standard node permet de faire des appels http avec [http.request()](https://nodejs.org/api/http.html#http_http_request_options_callback).

Il existe des librairies bâties au-dessus de la librairie standard, qui offrent :
- une interface (API) simplifiée (ex: pour traiter une réponse, la librairie standard prend en argument un callback et émet des évènements, alors que `axios` renvoie une promesse);
- des fonctionnalités supplémentaires.

La plupart des contributeurs de ces librairies sont bénévoles.
Il y a donc un risque que leur maintenance ne soit un jour plus assurée.
De plus, toutes n'offrent pas les mêmes fonctionnalités.

Pour ces deux raisons, nous pourrions être amenés à vouloir changer de librairie.
Dans ce cas, le coût de migration (réécriture du code) est un facteur à prendre en compte.

Cette encapsulation a déjà été réalisée sur le logging avec [logger](./../../api/lib/infrastructure/logger.js).
À la question "Quels sont les cas pertinents pour encapsuler ?", les appels http sont régulièrement [cités](https://levelup.gitconnected.com/why-you-should-often-wrap-your-dependencies-5fced2999616).

### Solution n°1 : Encapsuler les appels à la librairie http dans un composant

Un composant, [http-agent](../../api/lib/infrastructure/http/http-agent.js), appelle la librairie (ex: `axios`).

Le code de production fait appel à ce composant uniquement pour tout appel http.

Avantages :
- diminution du coût de migration: seul ce composant doit être modifié.

Inconvénients :
- le développeur doit retenir l'usage et le nom et du composant (ce coût est partiellement mitigeable avec de la documentation et des règles de lint, mais ne peut être totalement supprimé) ;
- le développeur doit retenir son API et le mapping avec la librairie appelée.

### Solution n°2 : Appeler directement la librairie

Le code de production fait directement appel à la librairie.

Avantages :
- montée en compétences facilitée : le développeur connait probablement déjà la librairie de par ses expériences précédentes

Inconvénients :
- augmentation du coût de migration : tous les appels doivent être modifiés

## Décision
La solution n°1 est adoptée

## Conséquences
En dehors des API externes proposant une librairie dédiée (ex: [mailjet](https://github.com/mailjet/mailjet-apiv3-nodejs)), 
appeler le composant `http-agent` à la place de la librairie (ex: `axios`).

Ajouter une règle de lint pour empêcher l'usage direct et non-intentionnel de la librairie (ex: `axios`).
