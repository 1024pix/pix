# 19. Typer les identifiants

Date : 2020-27-01

## État

Accepté

## Contexte

Sur ce projet, nous avons besoin de :
- éviter les incohérences en contrôlant la validité des données, notamment des identifiants
- pouvoir consulter les types de données (ex: lors des phases de design) dans un seul endroit  
- isoler le domaine, notamment de l'implémentation des identifiants dans les data-provider
  - cache
  - BDD propre ou distante (LCMS)
- permettre le changement de type
- disposer de plusieurs types, suivant les exigences d'implémentation

Cela ne veut pas dire que :
- le domaine fixe arbitrairement le type, car il risque de ne pas pouvoir être implémenté dans les data-provider
- le domaine impose un format de sérialisation à l'interface REST entre un front et l'API

Nous souhaitons plutôt que : 
- le domaine contienne la description des types d'identifiant
- les données manipulées puissent être contrôlées par rapport à cette description 

### Solution n°1 : contrôler le type côté domaine
Il est possible de contrôler la validité des données fournies lors de l'instanciation des objets du domaine.
Ce contrôle peut être effectué par une libraire dédiée, par exemple [Joi](https://github.com/sideway/joi).

Il est aussi possible de le faire en utilisant au lieu du langage Javascript le language TypeScript.
Dans ce cas, la vérification de type (type checking) est déléguée au langage.

Avantages :
- met le domaine au centre
- si un langage typé est choisi, prévient les erreurs d'inattention

Inconvénients :
- performance moindre, car un identifiant incorrect traversera toutes les couches avant d'être rejeté
- si un langage typé est choisi, coût d'implémentation élevé (réécriture et formation des développeurs)

### Solution n°2 : contrôler le type côté application
Il est également possible de contrôler la validité des données fournies en entrée de l'API avec une librairie dédiée.
Cela n'est pas strictement de la responsabilité de la couche application.
Néanmoins, sous l'hypothèse que toutes les données déjà persistées sont conformes au modèle, et
en l'absence d'erreur dans le code, cela suffit à garantir que le type des données (ici, des identifiants) est conforme.

Bien que la vérification ne soit pas effectuée dans le domaine, la définition du type peut appartenir au domaine. 

Avantages :
- coût d'implémentation moins élevé (librairie Joi déjà connue, et solution déjà partiellement en place)
- performance plus élevée, car un identifiant incorrect sera rejeté avant d'être passé au controller

Inconvénients :
- le controller effectue une opération qui n'est pas de sa responsabilité première

## Décision
Au vu des coûts d'implémentation, le solution n° 2 est retenue.

## Conséquences

Dans le domaine, décrire les types d'identifiants du domaine en fonction de leur implémentation 
```javascript
  const implementationType = {
    positiveInteger32bits: Joi.number().integer().min(postgreSQLSequenceDefaultStart).max(postgreSQLSequenceEnd).required(),
    alphanumeric255: Joi.string().max(255).required(),
  };
  
  const campaignId = implementationType.positiveInteger32bits;
  const userId = implementationType.positiveInteger32bits;
```

N'exposer que les types du domaine
```javascript
module.exports = {
  campaignId,
  userId,
};
```

En entrée de la route, contrôler la conformité de la donnée reçue par rapport au type du domaine
```javascript

  const identifiersType = require('../../domain/types/identifiers-type');  

  method: 'GET',
  path: '/api/users/{userId}/campaigns/{campaignId}/profile',
  config: {
    validate: {
      params: Joi.object({
        userId: identifiersType.userId,
        campaignId: identifiersType.campaignId,
      }),
    },
```

Ne pas écrire de test d'intégration sur ce contrôle
