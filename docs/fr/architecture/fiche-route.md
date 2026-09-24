# Fiche — Route

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - `R2` a une source : la page « 4.Application » de la documentation d'architecture, dans l'espace
>   Confluence EDTDT. Cette page porte son propre `TODO` : elle dit décrire la pratique plutôt que
>   prescrire un contrat. La règle est validée : voir « Décisions prises » dans `corpus-index.md`.
>   Elle reste à écrire dans un ADR, parce que sa source vit hors du dépôt.
> - Le **motif** que cette fiche donne au classement de `R2`, la visibilité d'un oubli, n'a pas de
>   source. La page en donne un autre. Voir le § 4.
> - Le § 6 n'annonce aucun faux positif pour le script de `R2`. Or une route authentifiée sans
>   restriction n'a aucune des trois formes que le script reconnaît, et le § 2 dit cet état légitime
>   et fréquent. Un script qui exige l'une des trois formes signale donc ces routes. Une piste existe :
>   exiger sur ces routes une mention explicite du type « authentifié suffit ». Elle revient à
>   inventorier toutes les routes, et son coût reste à mettre en balance avec ce qu'elle rapporte.
> - Le numéro X2 n'est pas attribué. Il portait « aucune liste des routes délibérément publiques »,
>   et en concluait `R2` invérifiable. Or `auth: false` déclare une route publique, et cette
>   déclaration est employée. La vérification de `R2` n'a donc aucun préalable. Le numéro n'est pas
>   réattribué.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants** — classés par ROI, comme au § 4.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**R2**](#r2-les-contrôles-daccès-sont-déclarés-en-pre-handler) | les contrôles d'accès sont déclarés en pre-handler | **forte** | script, faisable aujourd'hui |
| [**R1**](#r1-la-route-déclare-et-valide-la-forme-de-ses-entrées) | la route déclare et valide la forme de ses entrées | **forte** | script, faux positifs faibles |
| [**R4**](#r4-aucune-logique-dans-la-route) | aucune logique dans la route | moyenne | règle ESLint, à mesurer |
| [**R3**](#r3-la-route-est-documentée) | la route est documentée | moyenne | script, sans faux positif |
| [**R5**](#r5-une-adresse-et-une-méthode-un-gestionnaire) | une adresse et une méthode, un gestionnaire | hygiène | revue |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-le-contrôle-des-droits-est-écrit-dans-le-contrôleur) | le contrôle des droits est écrit dans le contrôleur | **à corriger** |
| [**X3**](#x3-une-validation-de-route-exprime-une-règle-métier) | une validation de route exprime une règle métier | **à corriger** |
| [**X4**](#x4-des-fonctions-sont-écrites-en-ligne-dans-la-déclaration) | des fonctions sont écrites en ligne dans la déclaration | à surveiller |
| [**X5**](#x5-la-route-est-un-fichier-de-configuration-écrit-en-javascript) | la route est un fichier de configuration écrit en JavaScript | rien à faire |

Hors numérotation : le [test forme / règle](#distinguer-forme-et-règle) sous `R1`. Il dit ce qui
appartient à la validation de route et ce qui appartient au domaine.

---

## 1. Rôle

Une route **déclare**. Elle ne fait rien.

Elle porte cinq déclarations, et rien d'autre :

- l'adresse et la méthode ;
- la forme attendue des entrées ;
- les contrôles d'accès ;
- le gestionnaire ;
- la documentation.

C'est un fichier de configuration écrit en JavaScript. Toute expression évaluée au-delà de la
déclaration est un signal. Ce que ce choix coûte est décrit sous `X5` au § 5.

La route est le seul endroit du dépôt où les droits d'accès sont **auditables** en lecture. Trois
déclarations disent qui accède à une route :

- un pre-handler de sécurité ;
- `auth: false`, pour une route publique ;
- une stratégie d'authentification explicite.

Un contrôle écrit dans un contrôleur sort de la route, et l'audit ne le voit plus. C'est `R2`.

### Ce qu'une route n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une route.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| extrait les paramètres et appelle un usecase | un contrôleur | `fiche-controleur.md` |
| réalise l'intention métier | un usecase | `fiche-usecase.md` |
| met en forme la réponse | un sérialiseur | `fiche-serialiseur.md` |
| vérifie qu'une valeur existe en base | un usecase, ou un pre-handler qui charge | `fiche-usecase.md` |
| associe une erreur du domaine à un code HTTP | le mappeur d'erreurs du contexte | — |
| expose une capacité à un autre contexte | `application/api/` | `fiche-api-interne.md` |

---

## 2. Invariants

### R1. La route déclare et valide la forme de ses entrées

**Énoncé.** La forme des paramètres d'adresse, de la chaîne de requête et du corps est déclarée sur
la route. Elle n'est pas vérifiée dans le contrôleur.

#### Distinguer forme et règle

Ce test est le cœur de l'invariant. Il s'applique à chaque schéma :

```
« cet identifiant est un entier positif »            → forme, ici
« cet identifiant désigne une organisation active »  → règle métier, dans le domaine
```

Voici quatre schémas d'un même fichier de route. Le test ne donne pas le même résultat pour chacun :

```js
minutes:   Joi.number().min(0).max(59).default(0),    // conforme : forme, une décomposition de durée
threshold: Joi.number().min(0).max(100).required(),   // conforme : forme, un pourcentage
level:     Joi.number().min(0).max(8).required(),     // fautif : règle métier, le nombre de niveaux
hours:     Joi.number().min(0).max(999).default(0),   // ni l'un ni l'autre : un maximum arbitraire
```

Le troisième schéma est fautif. Le nombre de niveaux du référentiel est une décision métier, et une
constante la porte déjà ailleurs. Le `8` écrit sur la route en est une copie, qui ne suivra pas les
changements de cette constante.

Le quatrième n'est ni une forme ni une règle : c'est un maximum que personne ne peut justifier. Rien
n'est à déplacer. Le maximum se retire, ou se motive.

**Ce qui casse.** Une règle métier écrite dans la validation de route est **contournable**. Un script,
un job ou une API interne qui appelle le même usecase ne passe pas par elle. La règle n'existe donc
que pour un seul chemin d'appel, et personne ne le sait. C'est `X3` au § 5.

Un type d'identifiant partagé, comme `identifiersType.organizationId`, est préféré à un schéma
réécrit à chaque route : un identifiant mal formé produit alors partout la même erreur.

### R2. Les contrôles d'accès sont déclarés en pre-handler

**Énoncé.** Le contrôle des droits est déclaré dans la configuration de la route. Il n'est jamais
écrit dans le gestionnaire.

```js
// conforme : le droit est lisible sans ouvrir un autre fichier
{
  method: 'GET',
  path: '/api/organizations/{organizationId}/courses',
  config: {
    pre: [
      { method: checkDisplayCatalogueIsEnabled },
      { method: securityPreHandlers.checkUserBelongsToOrganization },
    ],
    handler: combinedCourseController.getCourseByOrganizationId,
    validate: {
      params: Joi.object({ organizationId: identifiersType.organizationId }),
    },
    notes: ["- Récupération du catalogue de parcours liés à l'organisation"],
    tags: ['api', 'quest', 'catalogue'],
  },
}

// fautif : le droit est vérifié dans le contrôleur (exemple complet sous X1 au § 5)
const { userId, competenceId } = Scorecard.parseId(scorecardId);
if (parseInt(authenticatedUserId) !== parseInt(userId)) {
  throw new UserNotAuthorizedToAccessEntityError();
}
```

La route conforme satisfait `R1`, `R2`, `R3` et `R5`. Sa lecture suffit à savoir qui y a accès, sous
quelle condition d'activation, avec quelle forme d'entrée et quel gestionnaire.

**Deux propriétés que rien d'autre ne donne.** La lecture d'une route suffit à savoir qui y a accès.
Et une route **sans** contrôle se repère à l'absence des trois déclarations, donc l'absence est
visible. Savoir si cette absence est un oubli reste en revue : voir la limite de `R2` ci-dessous.

**Ce qui casse.** Dans un contrôleur, un contrôle oublié ne laisse aucune trace : son absence ne se
distingue pas d'un fichier qui n'en a pas besoin. Auditer les accès du dépôt demande alors de lire
tous les contrôleurs, un par un. C'est `X1` au § 5.

**Cas limite fréquent.** Le droit dépend d'une donnée métier à charger. La documentation
d'architecture place l'autorisation « autant que possible » dans un pre-handler, et écarte **à la
fois** le contrôleur et le usecase. L'ordre de préférence est donc :

1. un pre-handler qui charge ce qu'il faut ;
2. à défaut, un usecase dont l'autorisation est l'intention, et qui lève une erreur dédiée ;
3. jamais le contrôleur.

**Le contrat d'un pre-handler de sécurité est documenté**, donc sa forme n'a pas de variante :

- la requête en premier paramètre, l'objet de réponse en second ;
- `h.response(true)` en cas d'autorisation ;
- une réponse 403 avec `takeover()` en cas d'interdiction.

Plusieurs autorisations se combinent par l'utilitaire prévu à cet effet plutôt qu'à la main.

**Les routes délibérément publiques se déclarent comme telles**, par `auth: false`. Une route à
authentification optionnelle déclare sa stratégie d'authentification. `R2` se vérifie donc sans rien
écrire d'autre : une route déclare un pre-handler de sécurité, se déclare publique, ou déclare sa
stratégie.

**La limite de `R2`.** Une route qui n'a aucune de ces trois déclarations est **authentifiée sans
restriction supplémentaire** : tout utilisateur connecté y accède. Cet état est légitime et fréquent,
et il ne se distingue pas d'une restriction oubliée. Aucune déclaration ne lèvera cette ambiguïté,
parce que savoir si « authentifié suffit » est une question de métier, pas de forme. Ce point reste
en revue humaine. C'est le seul angle mort de `R2`.

### R3. La route est documentée

**Énoncé.** Chaque route déclare ses étiquettes et sa description. La documentation d'API en est
générée, donc elle suit le code au lieu de dériver.

La route conforme de `R2` déclare `notes` et `tags`. Celle-ci ne déclare ni l'un ni l'autre :

```js
// fautif : ni description ni étiquettes ; le paramètre {target} n'est pas validé non plus (R1)
{
  method: 'GET',
  path: '/api/information-banners/{target}',
  options: {
    auth: false,
    handler: bannerController.getInformationBanner,
    cache: false,
  },
}
```

**Ce qui casse.** L'usage d'une route sans description n'est connu que de son auteur. Et la
documentation générée devient incomplète en silence : rien ne signale une entrée manquante.

### R4. Aucune logique dans la route

**Énoncé.** La route déclare. Aucune fonction n'est écrite en ligne dans l'objet de configuration.

```js
// conforme : le gestionnaire est référencé, pas enveloppé
handler: usersMeController.getCurrentUser,

// fautif, mais bénin : une enveloppe qui n'ajoute rien
handler: (request, h) => usersMeController.getCurrentUser(request, h),

// fautif, et nuisible : du code non testé, invisible depuis le contrôleur
// hypothétique : aucun gestionnaire en ligne du code ne contient de logique
handler: async (request, h) => {
  const id = Number(request.params.id);
  if (Number.isNaN(id)) return h.response().code(400);
  return userAdminController.getUserDetails(request, h);
},
```

La forme bénigne est la plus répandue, et elle ne cache rien : elle réécrit à la main ce que la forme
conforme fait déjà. Elle ne présente pas de risque en elle-même. Son coût est ailleurs : elle rend la
forme nuisible invisible en revue, parce qu'une fonction en ligne de plus ne surprend plus personne.

La même enveloppe entoure souvent l'utilitaire de combinaison des autorisations, dans `pre`. La forme
conforme passe directement la fonction que l'utilitaire renvoie :
`{ method: securityPreHandlers.hasAtLeastOneAccessOf([…]) }`. Voir `X4` au § 5.

**Ce qui casse.** Ce qui est déclaré est vérifiable ; ce qui est écrit en ligne ne l'est pas. Le code
en ligne échappe aux règles des autres fiches. Il rend aussi `R1` et `R2` non fiables, parce qu'une
validation ou un contrôle peut y être enfoui sans que rien ne le déclare.

**Exception.** Le traitement d'un échec de validation s'écrit en ligne quand le framework impose de le
déclarer sur la route. Il est autorisé s'il est minimal et uniforme entre les routes. Voir `X4`.

### R5. Une adresse et une méthode, un gestionnaire

**Énoncé.** Aucun branchement sur un paramètre ne choisit le gestionnaire. Deux comportements
distincts sont deux routes, avec chacune leur validation, leurs droits et leur documentation.

```js
// conforme : deux lectures, deux routes, chacune avec ses droits
{ method: 'GET', path: '/api/combined-courses',
  config: { auth: { strategy: jwtOptionalUserAuthenticationStrategyName },
            handler: combinedCourseController.getByCode, … } },
{ method: 'GET', path: '/api/organizations/{organizationId}/courses',
  config: { pre: [ … ], handler: combinedCourseController.getCourseByOrganizationId, … } },

// fautif, hypothétique : aucune route du code ne branche son gestionnaire
handler: (request, h) =>
  request.query.filter?.organizationId
    ? combinedCourseController.getCourseByOrganizationId(request, h)
    : combinedCourseController.getByCode(request, h),
```

**Ce qui casse.** Rien directement : c'est un invariant d'hygiène. Il rend en revanche `R2` vérifiable
mécaniquement : une route, un jeu de droits. Une route à deux gestionnaires a deux jeux de droits
possibles, et le script du § 6 ne peut plus conclure.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Une route délibérément publique, **déclarée comme telle** | **autorisé** : c'est la déclaration qui compte, pas l'absence de pre-handler. `R2` |
| Une route à authentification optionnelle, qui déclare sa stratégie | **autorisé** : la stratégie déclarée dit qui accède. `R2` |
| Traitement en ligne d'un échec de validation | **autorisé** si minimal et uniforme. `R4` |
| Un pre-handler qui charge une donnée pour décider du droit | **autorisé** : c'est la première voie du cas limite de `R2` |
| Une route qui renvoie un fichier, avec ses en-têtes déclarés | **autorisé** |
| Plusieurs pre-handlers chaînés | **autorisé** : c'est la forme normale d'un contrôle composé |
| Plusieurs autorisations combinées par l'utilitaire documenté | **autorisé**, et c'est la forme prescrite, pas une composition écrite à la main. Une enveloppe écrite en ligne autour de l'utilitaire relève de `R4` |
| Une limite de taille de charge déclarée sur la route | **autorisé** : c'est une contrainte de forme, donc `R1` |
| Une validation qui exprime une règle métier | **pas une exception** : elle est contournable. `R1`, et `X3` |
| Un contrôle de droit dans le contrôleur | **pas une exception** : c'est `X1` |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **R2** contrôles d'accès en pre-handler | **forte** | Les droits d'une route s'auditent en la lisant. Et l'absence de contrôle se voit dans la déclaration, ce qui rend un oubli repérable, sauf sur une route authentifiée sans restriction (limite de `R2` au § 2) |
| **R1** validation déclarée | **forte** | Le domaine ne reçoit jamais une valeur dont la forme n'a pas été contrôlée. La déclaration valide **et** documente : un seul écrit sert deux fois |
| **R4** aucune logique | moyenne | Ce qui est déclaré est vérifiable. Le gain vient surtout de ce que `R4` rend `R1` et `R2` fiables |
| **R3** documentation déclarée | moyenne | La documentation d'API est générée depuis le code, donc elle ne dérive pas. Le gain croît avec le nombre de consommateurs externes |
| **R5** une adresse, un gestionnaire | hygiène | Aucun gain mesurable. Rend l'audit de `R2` mécanique |

Le rendement de `R2` ne vient pas d'un défaut de plus qu'il préviendrait : `R2` rend une **omission**
visible. Les autres invariants du corpus se vérifient sur ce qui est écrit ; `R2` se vérifie sur ce
qui est absent.

**Ce motif est une déduction de cette fiche**, distincte de la règle elle-même. La documentation
d'architecture prescrit bien `R2`, mais pour trois autres raisons : un code « clairement identifié,
simple et factorisé entre les différentes routes ». L'auditabilité, c'est-à-dire le fait qu'un
contrôle oublié se voie, n'y figure pas.

Un désaccord sur le classement en rentabilité forte porte donc sur ce motif, pas sur la règle.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si le **découpage** de l'API est bon : granularité des ressources,
cohérence des adresses, versionnement. Une route irréprochable peut appartenir à une API mal conçue.

Ils ne disent pas non plus si le droit déclaré est le **bon** droit. `R2` garantit qu'un contrôle est
déclaré et lisible, pas qu'il est juste.

---

## 5. Écarts avec la théorie

Le numéro X2 n'est pas attribué : voir l'encadré « À instruire ». La limite de `R2` qui en reste est
énoncée au § 2.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le contrôle des droits est écrit dans le contrôleur | dérive | La route cesse d'être auditable, et un oubli devient invisible. Aucun audit des accès n'est possible sans lire tous les contrôleurs | Le droit qui dépend d'une donnée à charger s'écrit sans pre-handler dédié | **À corriger** |
| **X3** Une validation de route exprime une règle métier | dérive | La règle ne vaut que pour le chemin HTTP. Un script ou un job appelant le même usecase la contourne | Le refus est immédiat, avec un message utilisateur | **À corriger** |
| **X4** Des fonctions sont écrites en ligne dans la déclaration | dérive | Une enveloppe en ligne banalise les fonctions en ligne, et une fonction qui porte de la logique passe alors inaperçue en revue. Ce code n'est pas testé et échappe aux règles des autres fiches | Réel dans un cas : le framework impose de déclarer le traitement d'échec de validation sur la route | *À surveiller* |
| **X5** La route est un fichier de configuration écrit en JavaScript | convention assumée | Rien n'empêche structurellement d'y écrire de la logique, d'où `R4` | Réel : les pre-handlers se composent, les schémas se partagent, et la déclaration reste dans le langage du reste du dépôt | *Rien à faire* |

### X1. Le contrôle des droits est écrit dans le contrôleur

**Ce que dit la théorie.** L'adaptateur d'entrée est dépourvu de logique : Martin le traite sous
*Presenters and Humble Objects*. Un contrôle d'accès est une décision, donc il se déclare au lieu de
s'écrire.

**Exemple concret.**

```js
// dans le contrôleur : le droit n'est plus lisible depuis la route
const findTutorials = async function (request, h, dependencies = { tutorialSerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  const scorecardId = request.params.id;

  const { userId, competenceId } = Scorecard.parseId(scorecardId);
  if (parseInt(authenticatedUserId) !== parseInt(userId)) {
    throw new UserNotAuthorizedToAccessEntityError();
  }
  …
};
```

Le cas est **rare**, et cet exemple a une cause identifiable. L'identifiant de la ressource est une
**clé concaténée**, et le propriétaire est dedans. Le contrôle d'appartenance suppose donc de
décomposer l'identifiant, ce qu'aucun pre-handler générique ne sait faire.

Cette clé est la clé de présentation décrite sous `V2` de `fiche-objet-valeur.md`. Elle a ici une
conséquence sur la couche d'accès.

Le contrôleur lève une erreur du domaine au lieu de choisir un code HTTP, donc `C2` de
`fiche-controleur.md` est respecté. La faute porte sur **l'endroit de la décision**, pas sur sa forme.

**Correction.** Déplacer le contrôle en pre-handler. Deux cas.

Si le droit ne dépend que de l'identité et du rôle, le déplacement est mécanique : un pre-handler
existant convient presque toujours.

Si le droit dépend d'une donnée métier à charger (ou d'un identifiant à décomposer, comme ici),
choisir entre les deux voies de `R2` : un pre-handler qui charge, ou un usecase dont l'autorisation
est l'intention. C'est une décision, pas un déplacement.

### X3. Une validation de route exprime une règle métier

**Ce que dit la théorie.** La règle métier vit dans le domaine, où tous les chemins d'appel la
traversent. L'ADR 2 pose que l'intelligence métier est dans l'API, et que le front ne fait que des
contrôles de surface. Le même raisonnement s'applique entre la route et le domaine.

**Exemple concret.** Le troisième schéma du test de `R1` :

```js
// sur la route : le maximum 8 est le nombre de niveaux du référentiel, une règle métier
level: Joi.number().min(0).max(8).required(),
```

Le nombre de niveaux vient de la configuration, exposée par la constante partagée `MAX_REACHABLE_LEVEL`.
Le `8` de la route en est une copie figée, et un script ou un job qui crée la même donnée ne le rencontre pas.

**Correction.** Garder sur la route la contrainte de **forme** : type, minimum et maximum qui relèvent de la forme, présence. Déplacer la
règle dans le domaine, sur l'objet qui porte la valeur. Si cet objet est un Value Object, `V3` de
`fiche-objet-valeur.md` s'applique.

```js
// sur la route : la forme seule
level: Joi.number().min(0).required(),
```

Le bénéfice perdu, le refus immédiat avec un message utilisateur, se récupère par le mappeur d'erreurs
du contexte : il associe l'erreur du domaine à une réponse HTTP que le front exploite. Les deux ne
s'excluent pas ; c'est leur confusion qui coûte.

Cet écart est voisin de `X2` de `fiche-objet-valeur.md`, qui traite la validation de **forme** à la
frontière plutôt que par le type. Ici il s'agit de règles, pas de formes, et le verdict est différent.

### X4. Des fonctions sont écrites en ligne dans la déclaration

**Ce que dit la théorie.** Une route déclare. Une expression évaluée au-delà de la déclaration n'est
plus une déclaration.

**Exemple concret.** Le cas admis et le cas fautif se ressemblent :

```js
// admis : le framework impose de déclarer le traitement d'échec ici
failAction: (request, h) => {
  return sendJsonApiError(new BadRequestError('Un des champs de recherche saisis est invalide.'), h);
},

// fautif : une enveloppe écrite en ligne autour de l'utilitaire de combinaison
method: (request, h) =>
  securityPreHandlers.hasAtLeastOneAccessOf([
    securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
    securityPreHandlers.checkAdminMemberHasRoleCertif,
    securityPreHandlers.checkAdminMemberHasRoleSupport,
    securityPreHandlers.checkAdminMemberHasRoleMetier,
  ])(request, h),
```

La forme nuisible, un gestionnaire en ligne qui porte de la logique, est illustrée sous `R4`.

**Correction.** Aucune sur le cas admis, qui est une contrainte du framework. Retirer l'enveloppe qui
ne fait que transmettre ses arguments :

```js
method: securityPreHandlers.hasAtLeastOneAccessOf([
  securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
  …
]),
```

Déplacer toute autre fonction dans le contrôleur, où `C2` de `fiche-controleur.md` s'applique.

Le verdict est *à surveiller* et non *à corriger*, parce que le motif légitime et le motif fautif ont
la même forme syntaxique. La règle du § 6 doit distinguer le champ où la fonction est déclarée. Sa
précision se mesure avant que la règle devienne bloquante.

### X5. La route est un fichier de configuration écrit en JavaScript

**Ce que dit la théorie.** Rien n'impose un format déclaratif. L'écart est avec l'esprit du patron :
une configuration écrite dans un langage complet n'a aucune barrière contre la logique.

**Exemple concret.** La déclaration est un objet JavaScript, donc tout y est permis :

```js
const ERRORS = { PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE' };

const register = async function (server) {
  server.route([{ method: 'GET', path: '…', config: { … } }]);
};
```

La première ligne est un exemple réel de ce que le format permet : une constante déclarée dans un
fichier de route, entre deux blocs d'imports.

**Correction.** Aucune. Un format déclaratif pur, JSON ou YAML, retirerait la composition des
pre-handlers et le partage des schémas. Ce sont eux qui rendent `R1` et `R2` praticables. Le coût est
réel, mais `R4` et sa règle de lint le paient, pas un changement de format.

Cette convention est la raison d'être de `R4` : sans elle, `R4` serait sans objet.

---

## 6. Vérification déterministe

La vérification de `R2`, la plus utile de cette fiche, s'écrit aujourd'hui, sans préalable. La
déclaration d'accès est déjà dans le code, sous trois formes reconnaissables.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **R2** contrôles d'accès | script `tests/tooling/` : toute route déclare un pre-handler de sécurité, **ou** `auth: false`, **ou** une stratégie explicite | ~40 lignes | aucun. Ne couvre pas les routes authentifiées sans restriction : voir la limite de `R2` au § 2 |
| **R3** documentation | script : toute route déclare étiquettes et description | ~30 lignes | aucun |
| **R1** validation déclarée | script : toute route ayant des paramètres d'adresse déclare leur validation | ~30 lignes | faibles : un paramètre validé par un type partagé plutôt que par un schéma explicite |
| **R4** aucune logique | règle ESLint : déclaration de fonction dans un objet de route, hors champ de traitement d'échec | ~30 lignes | **à mesurer** : voir `X4` |
| **R5** un gestionnaire | revue | — | — |

### R2 — faisable aujourd'hui, sans préalable

Le script est mécanique. Sa règle :

> Toute route déclare un pre-handler de sécurité, **ou** `auth: false`, **ou** une stratégie
> d'authentification explicite.

Les trois formes existent dans le code. La troisième s'oublie facilement en écrivant le script :

```js
// une route dont l'authentification est optionnelle : ni pre-handler, ni auth: false
config: {
  auth: { strategy: jwtOptionalUserAuthenticationStrategyName },
  handler: combinedCourseController.getByCode,
}
```

Elle est plus rare que les deux autres. Un script qui l'ignore signale pourtant du code légitime, et
perd sa crédibilité au premier passage.

Si le script signale toute route sans l'une des trois formes, un contrôle d'accès retiré par erreur
fait échouer un test. Ce choix est ouvert : voir l'encadré « À instruire ».

Le script **ne** couvre **pas** la route authentifiée sans restriction supplémentaire, qui n'a aucune
des trois formes. Il ne peut pas la signaler sans produire du bruit sur un état légitime. C'est la
limite de `R2` énoncée au § 2, et elle reste en revue. Les deux derniers paragraphes ne sont pas
conciliés : voir l'encadré « À instruire ».

### R3 et R1 — deux scripts triviaux

Les deux scripts parcourent les déclarations de routes et vérifient la présence des champs attendus.
La configuration d'une route se déclare sous `config` ou sous `options`, et les scripts lisent les
deux.

Aucun faux positif sur `R3`. Sur `R1`, un paramètre validé par un type partagé plutôt que par un
schéma explicite ressemble à une absence de validation. Un script qui ne reconnaît pas ce cas le
signale à tort. Le code n'a rien à corriger : la forme par type partagé est la meilleure des deux.

### R4 — la plus délicate

La règle distingue le traitement d'échec de validation, légitime, d'une autre fonction en ligne. Pour
cela, elle reconnaît le champ où la fonction est déclarée. C'est faisable. La règle s'écrit après les
trois autres, et se mesure avant de devenir bloquante, parce que le motif admis et le motif fautif ont
la même forme.

La règle se déclenche aussi sur l'enveloppe écrite autour de l'utilitaire de combinaison dans `pre`.
C'est une vraie violation de `R4`, pas un faux positif : voir `X4`.

### Ordre de mise en œuvre

Cet ordre suit le ROI. La vérification la plus rentable est aussi celle qui n'attend rien.

1. **R2** — le script, dès maintenant
2. **`X1`** — corriger les contrôles écrits dans les contrôleurs, que le script ne voit pas
3. **R3** puis **R1** — les deux scripts triviaux
4. **R4** — la règle ESLint, en avertissement d'abord

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **R3** documentation | partiel | Ajouter les champs manquants est mécanique. Le texte de la description est du contenu : le codemod pose l'emplacement et un `TODO`, pas la phrase |
| **X1** contrôle déplacé | partiel | Insérer un pre-handler existant, oui, quand le droit ne dépend que du rôle. Décider quel droit s'applique, non |

---

## 7. Le type

**Peu de gain sur cette couche.** Les objets de configuration du framework sont typés de façon large.
La validation déclarée produit un contrôle à l'exécution que le typage ne connaît pas : le type du
paramètre reçu par le contrôleur n'est pas déduit du schéma déclaré sur la route.

La garantie de `R1` reste donc une garantie d'exécution, pas de compilation.

Un gain existe si les identifiants sont typés nominalement. Une adresse qui déclare un identifiant
d'un type, et un contrôleur qui en attend un autre, deviennent alors détectables. Ce gain suppose
toute la chaîne migrée : c'est un bénéfice tardif. L'ADR 19 traite ce sujet, et a écarté le contrôle
de type dans le domaine pour son coût.

`R2` ne se typera pas. Un droit déclaré n'est pas une propriété de type, et aucune annotation ne dit
« cette route est protégée ». La vérification reste le script du § 6.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Route | **acceptance** : serveur réel, base réelle | les codes HTTP, **y compris les refus de droits** |

Rien en unitaire : une route ne contient pas de logique à tester. Si un test unitaire de route a du
sens, `R4` est violé. Cet indice de diagnostic n'a pas d'exception.

**Le test qui manque presque toujours est celui du refus.** Un test qui vérifie la réponse 200 pour un
utilisateur autorisé passerait aussi sans aucun contrôle d'accès. C'est le test de la réponse 403 pour
un autre utilisateur qui prouve que `R2` est tenu.

Limite : une route déclarée publique, ou à authentification optionnelle, n'a pas de refus à tester,
comme l'admet le § 3. Sa déclaration permet de le savoir sans rien inventorier.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, comme au § 4.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle ou le script correspondant existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est connu.

```
[ ] [auto]    R2  Un pre-handler de sécurité est déclaré, ou auth: false, ou une stratégie d'authentification explicite
[ ] [humain]  R2  Aucun contrôle de droit délégué au contrôleur
[ ] [humain]  R2  Si la route est authentifiée sans restriction, c'est voulu, pas un oubli
[ ] [partiel] R1  La forme de toutes les entrées est déclarée et validée
[ ] [humain]  R1  Aucune validation n'exprime une règle métier
[ ] [partiel] R4  Aucune fonction en ligne, sauf traitement d'échec de validation
[ ] [auto]    R3  Étiquettes et description présentes
[ ] [humain]  R5  Une adresse et une méthode, un seul gestionnaire
[ ] [humain]  Test d'acceptance couvrant le refus de droits, pas seulement l'accès autorisé
```

À terme, il reste sept lignes : deux `[partiel]` et cinq `[humain]`. Les deux qui comptent portent sur
`R2` : aucun contrôle délégué au contrôleur, et le refus testé. Aucune des deux ne se lit dans une
déclaration de route : la première demande d'ouvrir le contrôleur, la seconde d'ouvrir les tests.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » : l'adaptateur est dépourvu de logique | le livre de 2017 ; billet gratuit de 2012 |
| **R1** validation de forme sur la route | Pix : **ADR 2**, qui pose que l'intelligence métier est dans l'API et que le front ne fait que des contrôles de surface. **ADR 19**, qui retient le contrôle du type des identifiants à l'entrée de l'API, par Joi | ADR 2 et 19 |
| **R2** contrôles d'accès en pre-handler | **documentation d'architecture Pix**, page « 4.Application » : la logique d'autorisation « doit être réalisée autant que possible dans les securityPreHandlers, plutôt que dans les controllers ou les usecases ». La page donne aussi le contrat d'un securityPreHandler et l'utilitaire de combinaison des accès. Aucun ADR | espace Confluence EDTDT, page « 4.Application » |
| **R3** documentation déclarée | **aucune source** : convention Pix | — |
| **R4** aucune logique | Martin, même ch. | le livre de 2017 |
| **R5** une adresse, un gestionnaire | **aucune source** : convention de rangement | — |

Deux invariants sur cinq n'ont aucune source : `R3` et `R5`. La source de `R2` est la documentation
d'architecture.

Deux manques restent :

- La règle `R2` n'est adossée à **aucun ADR**. Elle vit dans une page Confluence, hors du dépôt, comme
  `P5` de `fiche-api-interne.md`. Une page peut changer sans que rien ici ne le signale.
- Le **motif** du classement de `R2` en rentabilité forte reste une déduction de cette fiche. La
  documentation en donne un autre, plus faible. Un ADR sur `R2` réglerait ce que vaut la règle, pas
  son existence.
