# Route

Une route déclare l'accès HTTP à une capacité de l'API. Elle vit dans `application/`, dans un fichier
de route.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à toute route. La ligne **Vérification** de chaque invariant dit
par quel moyen la règle se vérifie. Ce qui est en place dans la CI est dans
[`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) ·
[Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**R1**](#r1-la-route-déclare-et-valide-la-forme-de-ses-entrées) | la route déclare et valide la forme de ses entrées | script pour la présence, revue pour la règle métier |
| [**R2**](#r2-les-contrôles-daccès-sont-déclarés-en-pre-handler) | les contrôles d'accès sont déclarés en pre-handler | script qui classe et liste, revue pour les routes authentifiées sans restriction |
| [**R3**](#r3-la-route-est-documentée) | la route est documentée | script |
| [**R4**](#r4-aucune-logique-dans-la-route) | aucune logique dans la route | règle ESLint |
| [**R5**](#r5-une-adresse-et-une-méthode-un-gestionnaire) | une adresse et une méthode, un gestionnaire | revue |

Hors numérotation : le [test forme / règle](#distinguer-forme-et-règle) sous `R1`. Il dit ce qui
appartient à la validation de route et ce qui appartient au domaine.

---

## Rôle

Une route **déclare**. Elle ne fait rien.

Elle porte cinq déclarations, et rien d'autre :

- l'adresse et la méthode ;
- la forme attendue des entrées ;
- les contrôles d'accès ;
- le gestionnaire ;
- la documentation.

C'est un fichier de configuration écrit en JavaScript. Toute expression évaluée au-delà de la
déclaration est un signal. Ce que ce choix coûte est décrit sous `X5` de
[`ecarts.md`](ecarts.md#x5-la-route-est-un-fichier-de-configuration-écrit-en-javascript).

La route est le seul endroit du dépôt où les droits d'accès sont **auditables** en lecture. Trois
déclarations disent qui accède à une route :

- un pre-handler de sécurité ;
- `auth: false`, pour une route publique ;
- une stratégie d'authentification explicite.

Un contrôle écrit dans un contrôleur sort de la route, et l'audit ne le voit plus. C'est `R2`.

### Ce qu'une route n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une route.

| Le code… | Va dans | Dossier |
| --- | --- | --- |
| extrait les paramètres et appelle un usecase | un contrôleur | `../controleur/README.md` |
| réalise l'intention métier | un usecase | `../usecase/README.md` |
| met en forme la réponse | un sérialiseur | `../serialiseur/README.md` |
| vérifie qu'une valeur existe en base | un usecase, ou un pre-handler qui charge | `../usecase/README.md` |
| associe une erreur du domaine à un code HTTP | le mappeur d'erreurs du contexte | — |
| expose une capacité à un autre contexte | `application/api/` | `../api-interne/README.md` |

---

## Invariants

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

**Code.** [`training-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/trainings/training-route.js#L138-L139) pour `hours` et `minutes`, [lignes 311 et 316](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/trainings/training-route.js#L311-L316) pour `threshold` et `level`. Les quatre lignes sont réordonnées et alignées.

Le troisième schéma est fautif. Le nombre de niveaux du référentiel est une décision métier, et une
constante la porte déjà ailleurs. Le `8` écrit sur la route en est une copie, qui ne suivra pas les
changements de cette constante.

Le quatrième n'est ni une forme ni une règle : c'est un maximum que personne ne peut justifier. Rien
n'est à déplacer. Le maximum se retire, ou se motive.

**Ce qui casse.** Une règle métier écrite dans la validation de route est **contournable**. Un script,
un job ou une API interne qui appelle le même usecase ne passe pas par elle. La règle n'existe donc
que pour un seul chemin d'appel, et personne ne le sait.

Un type d'identifiant partagé, comme `identifiersType.organizationId`, est préféré à un schéma
réécrit à chaque route : un identifiant mal formé produit alors partout la même erreur.

**Vérification.** Un script vérifie qu'une route ayant des paramètres d'adresse déclare leur
validation. Le test forme / règle se fait en revue. Voir
[`outillage.md`](outillage.md#r3-et-r1--deux-scripts-triviaux).

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

// fautif : le droit est vérifié dans le contrôleur
const { userId, competenceId } = Scorecard.parseId(scorecardId);
if (parseInt(authenticatedUserId) !== parseInt(userId)) {
  throw new UserNotAuthorizedToAccessEntityError();
}
```

**Code.** Conforme : [`combined-course-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/combined-course-route.js#L40-L59), simplifié : `notes` et `tags` sont raccourcis. Fautif : [`scorecard-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/application/scorecards/scorecard-controller.js#L30-L33).

La route conforme satisfait `R1`, `R2`, `R3` et `R5`. Sa lecture suffit à savoir qui y a accès, sous
quelle condition d'activation, avec quelle forme d'entrée et quel gestionnaire.

**Ce qui casse.** Dans un contrôleur, un contrôle oublié ne laisse aucune trace : son absence ne se
distingue pas d'un fichier qui n'en a pas besoin. Auditer les accès du dépôt demande alors de lire
tous les contrôleurs, un par un.

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

**Vérification.** Un script classe chaque route selon sa déclaration d'accès et liste les routes
authentifiées sans restriction, sans les faire échouer. L'examen de cette liste se fait en revue. Voir
[`outillage.md`](outillage.md#r2--un-script-sans-préalable).

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

**Code.** [`banner-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/communication/banner/application/banner-route.js#L5-L13).

**Ce qui casse.** L'usage d'une route sans description n'est connu que de son auteur. Et la
documentation générée devient incomplète en silence : rien ne signale une entrée manquante.

**Vérification.** Un script vérifie la présence des étiquettes et de la description. Voir
[`outillage.md`](outillage.md#r3-et-r1--deux-scripts-triviaux).

### R4. Aucune logique dans la route

**Énoncé.** La route déclare. Aucune fonction n'est écrite en ligne dans l'objet de configuration.

```js
// conforme : le gestionnaire est référencé, pas enveloppé
handler: usersMeController.getCurrentUser,

// fautif, mais bénin : une enveloppe qui n'ajoute rien
handler: (request, h) => usersMeController.getCurrentUser(request, h),

// fautif, et nuisible : du code non testé, invisible depuis le contrôleur
handler: async (request, h) => {
  const id = Number(request.params.id);
  if (Number.isNaN(id)) return h.response().code(400);
  return userAdminController.getUserDetails(request, h);
},
```

**Code.** Fautif bénin : [`users-me.route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/deprecated/application/users-me.route.js#L8). La forme conforme est la forme corrigée de la même ligne. La forme nuisible est hypothétique : aucun gestionnaire en ligne du code ne contient de logique.

La forme bénigne est la plus répandue, et elle ne cache rien : elle réécrit à la main ce que la forme
conforme fait déjà. Elle ne présente pas de risque en elle-même. Son coût est ailleurs : elle rend la
forme nuisible invisible en revue, parce qu'une fonction en ligne de plus ne surprend plus personne.

La même enveloppe entoure souvent l'utilitaire de combinaison des autorisations, dans `pre`. La forme
conforme passe directement la fonction que l'utilitaire renvoie :
`{ method: securityPreHandlers.hasAtLeastOneAccessOf([…]) }`.

**Ce qui casse.** Ce qui est déclaré est vérifiable ; ce qui est écrit en ligne ne l'est pas. Le code
en ligne échappe aux règles des autres fiches. Il rend aussi `R1` et `R2` non fiables, parce qu'une
validation ou un contrôle peut y être enfoui sans que rien ne le déclare.

**Exception.** Le traitement d'un échec de validation s'écrit en ligne quand le framework impose de le
déclarer sur la route. Il est autorisé s'il est minimal et uniforme entre les routes.

**Vérification.** Une règle ESLint signale une fonction déclarée dans un objet de route, hors du champ
de traitement d'échec. Voir [`outillage.md`](outillage.md#r4--la-plus-délicate).

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

**Code.** Conforme : [`combined-course-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/combined-course-route.js#L19-L59), simplifié. La forme fautive est hypothétique.

**Ce qui casse.** Rien directement : c'est un invariant d'hygiène. Il rend en revanche `R2` vérifiable
mécaniquement : une route, un jeu de droits. Une route à deux gestionnaires a deux jeux de droits
possibles, et le script de `R2` ne peut plus conclure.

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant de sa ligne. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **R2** | Une route délibérément publique, **déclarée comme telle** | autorisé : c'est la déclaration qui compte, pas l'absence de pre-handler |
| **R2** | Une route à authentification optionnelle, qui déclare sa stratégie | autorisé : la stratégie déclarée dit qui accède |
| **R4** | Traitement en ligne d'un échec de validation | autorisé si minimal et uniforme |
| **R2** | Un pre-handler qui charge une donnée pour décider du droit | autorisé : c'est la première voie du cas limite de `R2` |
| — | Une route qui renvoie un fichier, avec ses en-têtes déclarés | autorisé |
| **R2** | Plusieurs pre-handlers chaînés | autorisé : c'est la forme normale d'un contrôle composé |
| **R2** | Plusieurs autorisations combinées par l'utilitaire documenté | autorisé, et c'est la forme prescrite, pas une composition écrite à la main. Une enveloppe écrite en ligne autour de l'utilitaire relève de `R4` |
| **R1** | Une limite de taille de charge déclarée sur la route | autorisé : c'est une contrainte de forme |
| **R1** | Une validation qui exprime une règle métier | **pas une exception** : elle est contournable |
| **R2** | Un contrôle de droit dans le contrôleur | **pas une exception** : c'est une violation de `R2` |

---

## Exemple complet

Une route de lecture protégée par un pre-handler, tirée du code : la déclaration, son
enregistrement, son test d'acceptance. La déclaration est conforme telle quelle. Le test ne l'est
pas : il ne vérifie que l'accès autorisé. Le bloc du test est donc sa version corrigée.

```js
// la route — R1, R2, R3, R4 et R5 tenus
{
  method: 'GET',
  path: '/api/combined-courses/{combinedCourseId}',
  config: {
    pre: [{ method: questSecurityPreHandlers.checkUserCanManageCombinedCourse }],   // R2
    handler: combinedCourseController.getById,                                     // R4, R5
    validate: {
      params: Joi.object({
        combinedCourseId: identifiersType.combinedCourseId,                        // R1 : type partagé
      }),
    },
    notes: [                                                                       // R3
      "- Récupération du parcours combiné dont l'id est passé en paramètre," +
        " Nécessite que l'utilisateur soit membre de l'organisation propriétaire du parcours combiné",
    ],
    tags: ['api', 'combined-course', 'orga'],                                      // R3
  },
},
```

**Code.** [`combined-course-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/combined-course-route.js#L85-L102). Les commentaires sont ajoutés.

```js
// l'enregistrement — le fichier de route est un plugin, listé par le contexte
const register = async function (server) {
  server.route([ /* … les routes du fichier … */ ]);
};
export const combinedCourseRoute = { name: 'quest/combined-courses-api', register };

// api/src/quest/routes.js
const questRoutes = [combinedCourseRoute, questRoute, verifiedCodeRoute, combinedCourseBlueprintRoute, attestationRoute];
```

**Code.** Le plugin : [`combined-course-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/combined-course-route.js#L17-L18), [ligne 265](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/combined-course-route.js#L265). La liste du contexte : [`routes.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/routes.js#L7-L13), mise sur une ligne.

```js
// le test — acceptance, serveur et base réels
describe('GET /api/combined-courses/{combinedCourseId}', function () {
  context('when user has membership in the combined course organization', function () {
    it('should return the combined course details', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({ code: 'PARCOURS123', organizationId });
      databaseBuilder.factory.buildMembership({ userId, organizationId });
      await databaseBuilder.commit();

      const response = await server.inject({
        method: 'GET',
        url: `/api/combined-courses/${combinedCourseId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      expect(response.statusCode).to.equal(200);
    });
  });

  // ajouté : le refus prouve que R2 est tenu
  context('when user has no membership in the combined course organization', function () {
    it('should return 403', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const { id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({ code: 'PARCOURS123', organizationId });
      await databaseBuilder.commit();

      const response = await server.inject({
        method: 'GET',
        url: `/api/combined-courses/${combinedCourseId}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      expect(response.statusCode).to.equal(403);
    });
  });
});
```

**Code.** Version corrigée de [`combined-course-route_test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/quest/acceptance/application/combined-course-route_test.js#L231-L258), simplifiée : le parcours est construit sans son nom, et les options de requête sont en ligne.

Corrections apportées :

- ajout du cas de refus : un utilisateur connecté, sans appartenance à l'organisation du parcours,
  reçoit une réponse 403. Sans ce cas, le test passerait aussi sans le pre-handler. Invariant `R2`,
  et règle du [refus testé](#tests-attendus).

---

## Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Route | **acceptance** : serveur réel, base réelle | les codes HTTP, **y compris les refus de droits** |

Rien en unitaire : une route ne contient pas de logique à tester. Si un test unitaire de route a du
sens, `R4` est violé. Cet indice de diagnostic n'a pas d'exception.

**Le test qui manque presque toujours est celui du refus.** Un test qui vérifie la réponse 200 pour un
utilisateur autorisé passerait aussi sans aucun contrôle d'accès. C'est le test de la réponse 403 pour
un autre utilisateur qui prouve que `R2` est tenu.

Limite : une route déclarée publique, ou à authentification optionnelle, n'a pas de refus à tester,
comme l'admettent les [exceptions légitimes](#exceptions-légitimes). Sa déclaration permet de le
savoir sans rien inventorier.

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle ou le script correspondant existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier, aucun moyen déterministe n'est connu.

```
[ ] [auto]    R2  La route est classée : pre-handler de sécurité, auth: false, stratégie explicite, ou aucune des trois
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

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| La couche | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » |
| **R1** validation de forme sur la route | ADR 2, « Style d'architecture », et ADR 19, « Typer les identifiants » |
| **R2** contrôles d'accès en pre-handler | documentation d'architecture Pix, page « 4.Application », sans ADR |
| **R3** documentation déclarée | convention d'équipe, sans source |
| **R4** aucune logique | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » |
| **R5** une adresse, un gestionnaire | convention de rangement, sans source |
