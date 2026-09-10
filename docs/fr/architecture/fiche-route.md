# Fiche — Route

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - `R2` **a une source**, contrairement à ce que ce corpus a longtemps affirmé : la documentation
>   d'architecture de l'espace Confluence EDTDT, page « 4.Application », l'énonce de façon
>   prescriptive. Ce qui n'a pas de source, c'est le **motif** que cette fiche lui donne — la
>   visibilité d'un oubli. La page en donne un autre. Voir le § 4.
> - Cette page porte son propre `TODO` : elle dit décrire la pratique plutôt que prescrire un contrat.
>   **Validé le 2026-09-08** : la règle est tenue pour vraie. Reste à la faire redescendre dans un ADR,
>   sa source vivant hors du dépôt.
> - Le numéro **X2** n'est pas attribué. Il portait « aucune liste des routes délibérément publiques »,
>   ce qui était faux : `auth: false` déclare une route publique, et c'est employé. La vérification de
>   `R2` n'a donc aucun préalable. Le numéro n'est pas réattribué.
> - La section « Note sur le préfixe » a été retirée : la collision entre `R` route et `R` read-model
>   est levée, le read-model emploie `RM`.

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

L'artefact le plus cherché est le [test forme / règle](#distinguer-forme-et-règle) sous `R1` : il dit
ce qui appartient à la validation de route et ce qui appartient au domaine.

---

## 1. Rôle

Une route **déclare**. Elle ne fait rien.

Cinq déclarations, et rien d'autre : l'adresse et la méthode, la forme attendue des entrées, les
contrôles d'accès, le gestionnaire, la documentation.

C'est un fichier de configuration écrit en JavaScript. Toute expression évaluée au-delà de la
déclaration est un signal — voir `X5` au § 5 pour ce que ce choix coûte.

**Ce qui donne à cette couche son rendement particulier** : la route est le seul endroit du dépôt où
les droits d'accès sont auditables en lecture. Deux déclarations suffisent à savoir qui accède à quoi —
un pre-handler de sécurité, ou `auth: false`. Tout contrôle qui sort de la route pour aller dans un
contrôleur devient invisible à l'audit. C'est `R2`.

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

**Énoncé.** Paramètres d'adresse, chaîne de requête, corps : leur forme est déclarée ici, pas vérifiée
dans le contrôleur.

#### Distinguer forme et règle

C'est tout l'invariant, et c'est le test à appliquer devant chaque schéma :

```
« cet identifiant est un entier positif »            → forme, ici
« cet identifiant désigne une organisation active »  → règle métier, dans le domaine
```

Sur du code réel, le test se pose souvent sur trois schémas voisins, et il tranche différemment pour
chacun :

```js
minutes:   Joi.number().min(0).max(59).default(0),    // forme — une décomposition de durée
threshold: Joi.number().min(0).max(100).required(),   // forme — un pourcentage
level:     Joi.number().min(0).max(8).required(),     // règle métier — le nombre de niveaux
hours:     Joi.number().min(0).max(999).default(0),   // ni l'un ni l'autre — une borne arbitraire
```

Le troisième est le cas intéressant : le nombre de niveaux du référentiel est une décision métier, et
elle existe déjà ailleurs sous forme de constante. Le `8` écrit sur la route en est une copie, qui ne
sera pas mise à jour avec elle.

Le quatrième mérite d'être nommé aussi : un maximum que personne ne peut justifier n'est ni une forme
ni une règle. Il n'y a rien à déplacer, seulement à retirer ou à motiver.

**Ce qui casse.** Une règle métier écrite dans la validation de route est **contournable** : un
script, un job ou une API interne qui appellerait le même usecase ne passerait pas par elle. La règle
existe donc pour un seul chemin d'appel, et personne ne le sait. C'est `X3` au § 5.

Les types d'identifiants partagés valent mieux qu'un schéma réécrit à chaque route : un identifiant
mal formé devient une erreur unique et cohérente.

### R2. Les contrôles d'accès sont déclarés en pre-handler

**Énoncé.** Le contrôle des droits est déclaré dans la configuration de la route, jamais écrit dans le
gestionnaire.

```js
// conforme — le droit est lisible sans ouvrir un autre fichier
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
```

Cette route unique satisfait `R1`, `R2`, `R3` et `R5`, et se lit en dix secondes : qui y a accès, sous
quelle condition d'activation, quelle forme d'entrée, quel gestionnaire. C'est la démonstration du ROI
du patron, plus que n'importe quel énoncé.

**Deux propriétés que rien d'autre ne donne.** On lit une route et on sait qui y a accès. Et une route
**sans** contrôle se repère à l'absence de pre-handler, donc un oubli est visible.

**Ce qui casse.** Écrit dans un contrôleur, un contrôle oublié ne laisse aucune trace : l'absence ne
se distingue pas d'un fichier qui n'en a pas besoin. Il n'existe alors aucun moyen d'auditer les accès
du dépôt autrement qu'en lisant tous les contrôleurs, un par un. C'est `X1` au § 5.

**Le cas limite, et il est fréquent.** Un droit qui dépend d'une donnée métier à charger. La
documentation d'architecture dit « autant que possible » dans un pre-handler, et écarte **à la fois**
le contrôleur et le usecase. L'ordre de préférence est donc : un pre-handler qui charge ce qu'il faut ;
à défaut un usecase dont l'autorisation est l'intention et qui lève une erreur dédiée ; jamais le
contrôleur.

**Le contrat d'un pre-handler de sécurité est documenté**, ce qui retire toute latitude sur la forme :
la requête en premier paramètre, l'objet de réponse en second, `h.response(true)` en cas
d'autorisation, et une réponse 403 avec `takeover()` en cas d'interdiction. Plusieurs autorisations se
combinent par l'utilitaire prévu à cet effet plutôt qu'à la main.

**Les routes délibérément publiques se déclarent comme telles**, par `auth: false`. C'est ce qui
permet de vérifier `R2` sans rien écrire d'autre : une route déclare un pre-handler de sécurité, ou se
déclare publique.

**La borne, et elle est réelle.** Une route qui n'a ni l'un ni l'autre est **authentifiée sans
restriction supplémentaire** — tout utilisateur connecté y accède. C'est un état légitime et fréquent,
et il ne se distingue pas d'une restriction oubliée. Aucune déclaration ne lèvera cette ambiguïté :
savoir si « authentifié suffit » est une question de métier, pas de forme. C'est ce qui reste en revue
humaine, et c'est le seul angle mort de `R2`.

### R3. La route est documentée

**Énoncé.** Étiquettes et description sur chaque route. La documentation d'API en est générée, donc
elle suit le code au lieu de dériver.

**Ce qui casse.** Une route sans description est une route dont l'usage n'est devinable que par son
auteur. Et la documentation générée devient incomplète en silence : rien ne signale une entrée
manquante.

### R4. Aucune logique dans la route

**Énoncé.** Elle déclare. Aucune fonction n'est écrite en ligne dans l'objet de configuration.

```js
// fautif, mais bénin — une enveloppe qui n'ajoute rien
handler: (request, h) => usersMeController.getCurrentUser(request, h),

// fautif, et cette fois nuisible — du code non testé, invisible depuis le contrôleur
handler: async (request, h) => {
  const id = Number(request.params.id);
  if (Number.isNaN(id)) return h.response().code(400);
  return userAdminController.getUserDetails(request, h);
},
```

La première forme est la plus répandue, et elle ne cache rien : elle réécrit à la main ce que
`handler: usersMeController.getCurrentUser` fait déjà. Le coût n'est pas le risque, c'est qu'elle rend
la seconde forme invisible en revue — une fonction en ligne de plus ne surprend plus personne.

**Ce qui casse.** Ce qui est déclaré est vérifiable ; ce qui est écrit en ligne ne l'est pas. Le code
en ligne échappe aux règles des autres fiches, et il rend `R1` et `R2` non fiables — une validation ou
un contrôle peuvent y être enfouis sans que rien ne les déclare.

**L'exception admise** : le traitement d'un échec de validation, quand le framework impose de le
déclarer sur la route. À garder minimal et uniforme entre les routes. Voir `X4`.

### R5. Une adresse et une méthode, un gestionnaire

**Énoncé.** Pas de branchement sur un paramètre pour choisir le gestionnaire. Deux comportements
distincts sont deux routes, avec chacune leur validation, leurs droits et leur documentation.

**Ce qui casse.** Rien directement — c'est un invariant d'hygiène. Mais il rend `R2` mécaniquement
vérifiable : une route, un jeu de droits. Une route à deux gestionnaires a deux jeux de droits
possibles, et le script du § 6 ne peut plus conclure.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Une route délibérément publique, **déclarée comme telle** | **autorisé** — c'est la déclaration qui compte, pas l'absence de pre-handler. `R2` |
| Traitement en ligne d'un échec de validation | **autorisé** si minimal et uniforme. `R4` |
| Un pre-handler qui charge une donnée pour décider du droit | **autorisé**, c'est la première voie du cas limite de `R2` |
| Une route qui renvoie un fichier, avec ses en-têtes déclarés | **autorisé** |
| Plusieurs pre-handlers chaînés | **autorisé** — c'est la forme normale d'un contrôle composé |
| Plusieurs autorisations combinées par l'utilitaire documenté | **autorisé**, et c'est la forme prescrite — pas une composition écrite à la main |
| Une limite de taille de charge déclarée sur la route | **autorisé** — c'est une contrainte de forme, donc `R1` |
| Une validation qui exprime une règle métier | **pas une exception** — elle est contournable. `R1`, et `X3` |
| Un contrôle de droit dans le contrôleur | **pas une exception** — c'est `X1` |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **R2** contrôles d'accès en pre-handler | **forte** | On audite les droits d'une route en la lisant. Et un contrôle **oublié** se voit, parce que l'absence de pre-handler est visible dans la déclaration |
| **R1** validation déclarée | **forte** | Le domaine ne reçoit jamais une valeur dont la forme n'a pas été contrôlée. La déclaration valide **et** documente : un seul écrit sert deux fois |
| **R4** aucune logique | moyenne | Ce qui est déclaré est vérifiable. Le gain vient surtout de ce qu'il rend `R1` et `R2` fiables |
| **R3** documentation déclarée | moyenne | La documentation d'API est générée depuis le code, donc elle ne dérive pas. Rentable à proportion du nombre de consommateurs externes |
| **R5** une adresse, un gestionnaire | hygiène | Aucun gain mesurable. Rend l'audit de `R2` mécanique |

**`R2` est l'invariant au plus fort rendement du corpus.** La raison de son rendement n'est pas qu'il
prévient un défaut de plus que les autres : c'est qu'il rend une **omission** visible. Les autres
invariants du corpus se vérifient sur ce qui est écrit ; celui-là se vérifie sur ce qui est absent.

**Ce motif est une déduction de cette fiche**, et il faut le distinguer de la règle elle-même. La
documentation d'architecture prescrit bien `R2`, mais pour trois raisons différentes : du code
« clairement identifié, simple et factorisé entre les différentes routes ». L'auditabilité — le fait
qu'un contrôle oublié se voie — n'y figure pas.

La distinction compte : si l'équipe conteste le classement en rentabilité forte, c'est le motif qu'elle
discute, pas la règle.

### Ce que ça n'apporte pas

Rien ici ne dit si le **découpage** de l'API est bon : granularité des ressources, cohérence des
adresses, versionnement. Une route irréprochable peut appartenir à une API mal conçue.

Et rien ne dit si le droit déclaré est le **bon** droit. `R2` garantit qu'un contrôle est déclaré et
lisible, pas qu'il est juste.

---

## 5. Écarts avec la théorie

Le numéro **X2** n'est pas attribué. Il portait « aucune liste des routes délibérément publiques » et
affirmait que `R2` était invérifiable — ce qui était faux : `auth: false` déclare une route publique, et
la convention est employée. Ce qu'il en reste de vrai est une borne de `R2`, énoncée au § 2 : une route
authentifiée sans restriction supplémentaire ne se distingue pas d'une restriction oubliée, et aucune
déclaration ne lèvera cette ambiguïté, la question étant sémantique.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le contrôle des droits est écrit dans le contrôleur | dérive | La route cesse d'être auditable, et un oubli devient invisible. Aucun audit des accès n'est possible sans lire tous les contrôleurs | Le droit qui dépend d'une donnée à charger s'écrit sans pre-handler dédié | **À corriger** |
| **X3** Une validation de route exprime une règle métier | dérive | La règle ne vaut que pour le chemin HTTP. Un script ou un job appelant le même usecase la contourne | Le refus est immédiat, avec un message utilisateur | **À corriger** |
| **X4** Des fonctions sont écrites en ligne dans la déclaration | dérive | Du code non testé, invisible depuis le contrôleur, qui échappe aux règles des autres fiches | Réel dans un cas : le framework impose de déclarer le traitement d'échec de validation sur la route | *À surveiller* |
| **X5** La route est un fichier de configuration écrit en JavaScript | convention assumée | Rien n'empêche structurellement d'y écrire de la logique — d'où la nécessité de `R4` | Réel — les pre-handlers se composent, les schémas se partagent, et la déclaration reste dans le langage du reste du dépôt | *Rien à faire* |

### X1. Le contrôle des droits est écrit dans le contrôleur

**Ce que dit la théorie.** L'adaptateur d'entrée est dépourvu de logique — Martin le traite sous
*Presenters and Humble Objects*. Un contrôle d'accès est une décision, donc il se déclare plutôt qu'il
ne s'écrit.

**Exemple concret.**

```js
// dans le contrôleur — le droit n'est plus lisible depuis la route
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

Le cas est **rare**, et son unique occurrence est instructive parce qu'elle a une cause identifiable :
l'identifiant de la ressource est une **clé concaténée**, et le propriétaire est dedans. Le contrôle
d'appartenance suppose donc de parser l'identifiant, ce qu'aucun pre-handler générique ne sait faire.

C'est la clé de présentation de `V2` — voir `fiche-objet-valeur.md` — qui produit ici une conséquence
sur la couche d'accès.

À noter aussi : le contrôleur lève une erreur du domaine plutôt que de choisir un code HTTP, donc
`C2` de `fiche-controleur.md` est respecté. Ce qui est fautif est **l'endroit de la décision**, pas sa
forme.

**Correction.** Déplacer le contrôle en pre-handler. Deux cas.

Si le droit ne dépend que de l'identité et du rôle, le déplacement est mécanique : un pre-handler
existant convient presque toujours.

Si le droit dépend d'une donnée métier à charger — ou d'un identifiant à décomposer, comme ici — il
faut choisir entre les deux voies de `R2` : un pre-handler qui charge, ou un usecase dont
l'autorisation est l'intention. C'est une décision, pas un déplacement.

### X3. Une validation de route exprime une règle métier

**Ce que dit la théorie.** La règle métier vit dans le domaine, où tous les chemins d'appel la
traversent. L'ADR 2 pose d'ailleurs que l'intelligence métier est dans l'API et que le front ne fait
que des contrôles de surface — le même raisonnement s'applique d'un cran plus bas.

**Exemple concret.**

```js
// sur la route — la règle « le seuil ne dépasse pas le maximum de la campagne »
validate: {
  payload: Joi.object({
    threshold: Joi.number().max(Joi.ref('$campaignMax')),
  }),
}
```

**Correction.** Garder la contrainte de **forme** sur la route — type, bornes absolues, présence — et
déplacer la règle sur l'objet du domaine qui porte l'état, où `V3` s'applique.

Le bénéfice perdu — le refus immédiat avec un message utilisateur — se récupère par le mappeur
d'erreurs : une erreur du domaine porte un code exploitable par le front, c'est `I4` de
`fiche-repository.md`. Les deux ne s'excluent pas ; c'est leur confusion qui coûte.

Cet écart est voisin de `X2` de `fiche-objet-valeur.md`, qui traite la validation de **forme** à la
frontière plutôt que par le type. Ici il s'agit de règles, pas de formes, et le verdict est différent.

### X4. Des fonctions sont écrites en ligne dans la déclaration

**Ce que dit la théorie.** Une route déclare. Toute expression évaluée au-delà de la déclaration sort
du patron.

**Exemple concret.** Le cas légitime et le cas fautif se ressemblent :

```js
// admis — le framework impose de déclarer le traitement d'échec ici
failAction: (request, h) => {
  return sendJsonApiError(new BadRequestError('Un des champs de recherche saisis est invalide.'), h);
},

// fautif — de la logique déguisée en configuration
handler: async (request, h) => { /* extraction, garde, appel */ },
```

**Correction.** Aucune sur le cas admis, qui est une contrainte du framework. Pour le reste,
déplacer dans le contrôleur, où `C2` de `fiche-controleur.md` s'applique.

C'est classé *à surveiller* et non *à corriger* parce que le motif légitime et le motif fautif ont la
même forme syntaxique : la règle du § 6 doit distinguer le champ où la fonction est déclarée, ce qui
demande d'être mesuré avant d'être rendu bloquant.

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

**Correction.** Aucune. Un format déclaratif pur — JSON, YAML — retirerait la composition des
pre-handlers et le partage des schémas, qui sont exactement ce qui rend `R1` et `R2` praticables. Le
coût est réel mais il est payé par `R4` et par sa règle de lint, pas par un changement de format.

À noter comme convention explicite : c'est ce qui explique pourquoi `R4` existe. Sans cet écart,
l'invariant serait sans objet.

---

## 6. Vérification déterministe

La vérification la plus utile de cette fiche — celle de `R2` — s'écrit aujourd'hui, sans préalable :
la déclaration d'accès est déjà dans le code, sous trois formes qui se reconnaissent.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **R2** contrôles d'accès | script `tests/tooling/` : toute route déclare un pre-handler de sécurité, **ou** `auth: false`, **ou** une stratégie explicite | ~40 lignes | aucun. Ne couvre pas les routes authentifiées sans restriction — voir la borne au § 2 |
| **R3** documentation | script : toute route déclare étiquettes et description | ~30 lignes | aucun |
| **R1** validation déclarée | script : toute route ayant des paramètres d'adresse déclare leur validation | ~30 lignes | faibles — un paramètre validé par un type partagé plutôt qu'un schéma explicite |
| **R4** aucune logique | règle ESLint : déclaration de fonction dans un objet de route, hors champ de traitement d'échec | ~30 lignes | **à mesurer** — voir `X4` |
| **R5** un gestionnaire | revue | — | — |

### R2 — écrivable aujourd'hui, sans préalable

Le script est mécanique et n'attend rien :

> Toute route déclare un pre-handler de sécurité, **ou** `auth: false`, **ou** une stratégie
> d'authentification explicite.

Les trois formes existent réellement, et la troisième est facile à oublier en écrivant le script :

```js
// une route dont l'authentification est optionnelle : ni pre-handler, ni auth: false
config: {
  auth: { strategy: jwtOptionalUserAuthenticationStrategyName },
  handler: combinedCourseController.getByCode,
}
```

Elle est rare — quelques routes contre plusieurs dizaines en `auth: false` et plusieurs centaines à
pre-handler — mais un script qui l'ignore produit des faux positifs sur du code légitime, et perd sa
crédibilité au premier passage.

Quarante lignes, aucun faux positif, et un contrôle d'accès retiré par erreur devient un test rouge.

Ce que le script **ne** couvre pas : la route authentifiée sans restriction supplémentaire, qui n'a
aucune des trois formes. Le script ne peut pas la signaler sans produire du bruit sur un état
légitime. C'est la borne énoncée au § 2, et elle reste en revue.

Une piste pour la réduire sans tout inventorier : exiger `auth: false` **ou** un pre-handler **ou**
une mention explicite du type « authentifié suffit » sur les routes concernées. Ça revient à
inventorier huit cents routes, donc à mettre en balance avec ce que ça rapporte.

### R3 et R1 — deux scripts triviaux

Parcourir les déclarations de routes et vérifier la présence des champs attendus.

Aucun faux positif sur `R3`. Sur `R1`, un faux positif possible quand un paramètre est validé par un
type partagé plutôt que par un schéma explicite — à reconnaître dans le script plutôt qu'à corriger
dans le code, la forme par type partagé étant la meilleure des deux.

### R4 — la plus délicate

Distinguer une fonction de configuration légitime du traitement d'échec de validation demande de
reconnaître le champ où elle est déclarée. Faisable, mais à écrire après les trois autres, et à
mesurer avant de rendre bloquante : le motif admis et le motif fautif ont la même forme.

### Ordre de mise en œuvre

Cet ordre suit le ROI, ce qui est inhabituel dans le corpus : ici la vérification la plus rentable est
aussi celle qui n'attend rien.

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

**Peu de gain sur cette couche.** Les objets de configuration du framework sont typés de façon large,
et la validation déclarée produit un contrôle à l'exécution que le typage ne connaît pas : le type du
paramètre reçu par le contrôleur n'est pas déduit du schéma déclaré sur la route.

Il faut le dire plutôt que de laisser croire l'inverse. La sécurité de `R1` reste une garantie
d'exécution, pas de compilation.

Un gain existe si les identifiants sont typés nominalement : une adresse déclarant un identifiant d'un
type et un contrôleur en attendant un autre deviendrait détectable. Cela suppose la chaîne complète
migrée, donc c'est un bénéfice tardif — et c'est le sujet de l'ADR 19, qui l'a écarté pour son coût.

Ce qui ne se typera pas : `R2`. Un droit déclaré n'est pas une propriété de type, et aucune annotation
ne dit « cette route est protégée ». La vérification reste le script du § 6.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Route | **acceptance** — serveur réel, base réelle | les codes HTTP, **y compris les refus de droits** |

Rien en unitaire : une route ne contient pas de logique à tester. Si un test unitaire de route a du
sens, `R4` est violé — et c'est un indice de diagnostic sans borne.

**Le test qui manque presque toujours est celui du refus.** On vérifie qu'une route répond 200 pour un
utilisateur autorisé, rarement qu'elle répond 403 pour un autre. Or c'est le second qui prouve que
`R2` est tenu : le premier passerait tout aussi bien sans aucun contrôle d'accès.

La borne : une route déclarée publique n'a pas de refus à tester, ce qu'admet le § 3 — et c'est
`auth: false` qui permet de le savoir sans rien inventorier.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle ou
le script correspondant existe. `[partiel]` reste, réduite à ce qu'il ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [auto]    R2  Un pre-handler de sécurité est déclaré, ou auth: false
[ ] [humain]  R2  Aucun contrôle de droit délégué au contrôleur
[ ] [humain]  R2  Si la route est authentifiée sans restriction, c'est voulu — pas un oubli
[ ] [partiel] R1  La forme de toutes les entrées est déclarée et validée
[ ] [humain]  R1  Aucune validation n'exprime une règle métier
[ ] [partiel] R4  Aucune fonction en ligne, sauf traitement d'échec de validation
[ ] [auto]    R3  Étiquettes et description présentes
[ ] [humain]  R5  Une adresse et une méthode, un seul gestionnaire
[ ] [humain]  Test d'acceptance couvrant le refus de droits, pas seulement l'accès autorisé
```

À terme il reste cinq lignes, toutes de jugement. Les deux qui comptent portent sur `R2` : qu'aucun
contrôle ne soit délégué au contrôleur, et que le refus soit testé. Ni l'un ni l'autre ne se lit dans
une déclaration de route — le premier demande d'ouvrir le contrôleur, le second d'ouvrir les tests.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — l'adaptateur est dépourvu de logique | le livre de 2017 ; billet gratuit de 2012 |
| **R1** validation de forme sur la route | Pix : **ADR 2**, qui pose que l'intelligence métier est dans l'API et que le front ne fait que des contrôles de surface. **ADR 19** pour les identifiants typés | ADR 2 et 19 |
| **R2** contrôles d'accès en pre-handler | **documentation d'architecture Pix**, page « 4.Application » : la logique d'autorisation « doit être réalisée autant que possible dans les securityPreHandlers, plutôt que dans les controllers ou les usecases ». La page donne aussi le contrat d'un securityPreHandler et l'utilitaire de combinaison des accès. Aucun ADR | espace Confluence EDTDT, page « 4.Application » |
| **R3** documentation déclarée | **aucune source** — convention Pix | — |
| **R4** aucune logique | Martin, même ch. | le livre de 2017 |
| **R5** une adresse, un gestionnaire | **aucune source** — convention de rangement | — |

**Deux invariants sur cinq n'ont aucune source** : `R3` et `R5`. `R2` en a une, contrairement à ce que
ce corpus a affirmé jusqu'au 2026-09-08 — la documentation d'architecture la porte.

Ce qui reste à combler est plus étroit que ce qui était annoncé, et de deux natures.

La règle n'est adossée à **aucun ADR** : elle vit dans une page Confluence, hors du dépôt, comme `P5`
de `fiche-api-interne.md`. Une page peut changer sans que rien ici ne le signale.

Et le **motif** du classement en rentabilité forte reste une déduction de cette fiche. La
documentation en donne un autre, plus faible. C'est ce qu'un ADR gagnerait à trancher : pas
l'existence de la règle, mais ce qu'elle vaut.
