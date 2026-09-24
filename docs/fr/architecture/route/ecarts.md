# Route — écarts

Suivi : où le code des routes s'écarte de la théorie, et ce qui est décidé. **État au 2026-09-24.**
Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md), la théorie
dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le contrôle des droits est écrit dans le contrôleur | dérive | La route cesse d'être auditable, et un oubli devient invisible. Aucun audit des accès n'est possible sans lire tous les contrôleurs | Le droit qui dépend d'une donnée à charger s'écrit sans pre-handler dédié | **À corriger** |
| **X3** Une validation de route exprime une règle métier | dérive | La règle ne vaut que pour le chemin HTTP. Un script ou un job appelant le même usecase la contourne | Le refus est immédiat, avec un message utilisateur | **À corriger** |
| **X4** Des fonctions sont écrites en ligne dans la déclaration | dérive | Une enveloppe en ligne banalise les fonctions en ligne, et une fonction qui porte de la logique passe alors inaperçue en revue. Ce code n'est pas testé et échappe aux règles des autres fiches | Réel dans un cas : le framework impose de déclarer le traitement d'échec de validation sur la route | *À surveiller* |
| **X5** La route est un fichier de configuration écrit en JavaScript | convention assumée | Rien n'empêche structurellement d'y écrire de la logique, d'où `R4` | Réel : les pre-handlers se composent, les schémas se partagent, et la déclaration reste dans le langage du reste du dépôt | *Rien à faire* |

---

### X1. Le contrôle des droits est écrit dans le contrôleur

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

**Code.** [`scorecard-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/application/scorecards/scorecard-controller.js#L25-L40), simplifié : la lecture de la locale et l'appel du usecase sont omis.

Le cas est **rare**, et cet exemple a une cause identifiable. L'identifiant de la ressource est une
**clé concaténée**, et le propriétaire est dedans. Le contrôle d'appartenance suppose donc de
décomposer l'identifiant, ce qu'aucun pre-handler générique ne sait faire.

Cette clé est la clé de présentation décrite sous `V2` de `../objet-valeur/README.md`. Elle a ici une
conséquence sur la couche d'accès.

Le contrôleur lève une erreur du domaine au lieu de choisir un code HTTP, donc `C2` de
`../controleur/README.md` est respecté. La faute porte sur **l'endroit de la décision**, pas sur sa
forme.

**Verdict.** À corriger. Le contrôle sort de la route : un oubli devient invisible, et auditer les
accès demande de lire tous les contrôleurs. Le seul bénéfice est d'éviter un pre-handler dédié. La
règle est `R2` de [`README.md`](README.md#r2-les-contrôles-daccès-sont-déclarés-en-pre-handler), la
théorie dans
[`explication.md`](explication.md#x1-le-contrôle-des-droits-est-écrit-dans-le-contrôleur).

**Correction.** Déplacer le contrôle en pre-handler. Deux cas.

Si le droit ne dépend que de l'identité et du rôle, le déplacement est mécanique : un pre-handler
existant convient presque toujours.

Si le droit dépend d'une donnée métier à charger (ou d'un identifiant à décomposer, comme ici),
choisir entre les deux voies de `R2` : un pre-handler qui charge, ou un usecase dont l'autorisation
est l'intention. C'est une décision, pas un déplacement.

### X3. Une validation de route exprime une règle métier

**Exemple concret.** Le troisième schéma du [test forme / règle](README.md#distinguer-forme-et-règle)
de `R1` :

```js
// sur la route : le maximum 8 est le nombre de niveaux du référentiel, une règle métier
level: Joi.number().min(0).max(8).required(),
```

**Code.** [`training-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/trainings/training-route.js#L316).

Le nombre de niveaux vient de la configuration, exposée par la constante partagée
`MAX_REACHABLE_LEVEL`. Le `8` de la route en est une copie figée, et un script ou un job qui crée la
même donnée ne le rencontre pas.

**Verdict.** À corriger. La règle ne vaut que pour le chemin HTTP. Le bénéfice, un refus immédiat
avec un message utilisateur, se récupère autrement : voir la correction. La théorie est dans
[`explication.md`](explication.md#x3-une-validation-de-route-exprime-une-règle-métier).

**Correction.** Garder sur la route la contrainte de **forme** : type, minimum et maximum qui relèvent
de la forme, présence. Déplacer la règle dans le domaine, sur l'objet qui porte la valeur. Si cet
objet est un Value Object, `V3` de `../objet-valeur/README.md` s'applique.

```js
// sur la route : la forme seule
level: Joi.number().min(0).required(),
```

**Code.** Forme corrigée, hypothétique.

Le bénéfice perdu, le refus immédiat avec un message utilisateur, se récupère par le mappeur d'erreurs
du contexte : il associe l'erreur du domaine à une réponse HTTP que le front exploite. Les deux ne
s'excluent pas ; c'est leur confusion qui coûte.

### X4. Des fonctions sont écrites en ligne dans la déclaration

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

**Code.** Admis : [`organization.admin.route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/application/organization/organization.admin.route.js#L131-L133). Fautif : [même fichier](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/application/organization/organization.admin.route.js#L105-L111), même route.

La forme nuisible, un gestionnaire en ligne qui porte de la logique, est illustrée sous `R4` de
[`README.md`](README.md#r4-aucune-logique-dans-la-route).

**Verdict.** À surveiller, et non à corriger, parce que le motif légitime et le motif fautif ont la
même forme syntaxique. La règle de `R4` doit distinguer le champ où la fonction est déclarée. Sa
précision se mesure avant que la règle devienne bloquante : voir
[`outillage.md`](outillage.md#r4--la-plus-délicate).

**Correction.** Aucune sur le cas admis, qui est une contrainte du framework. Retirer l'enveloppe qui
ne fait que transmettre ses arguments :

```js
method: securityPreHandlers.hasAtLeastOneAccessOf([
  securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
  …
]),
```

**Code.** Forme corrigée, hypothétique.

Déplacer toute autre fonction dans le contrôleur, où `C2` de `../controleur/README.md` s'applique.

### X5. La route est un fichier de configuration écrit en JavaScript

**Exemple concret.** La déclaration est un objet JavaScript, donc tout y est permis :

```js
const ERRORS = { PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE' };

const register = async function (server) {
  server.route([{ method: 'GET', path: '…', config: { … } }]);
};
```

**Code.** [`combined-course-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/combined-course-route.js#L3-L18), simplifié.

La première ligne est un exemple réel de ce que le format permet : une constante déclarée dans un
fichier de route, entre deux blocs d'imports.

**Verdict.** Rien à faire. Le coût est réel, mais `R4` et sa règle de lint le paient, pas un
changement de format. La théorie est dans
[`explication.md`](explication.md#x5-la-route-est-un-fichier-de-configuration-écrit-en-javascript).

**Correction.** Aucune. Un format déclaratif pur, JSON ou YAML, retirerait la composition des
pre-handlers et le partage des schémas. Ce sont eux qui rendent `R1` et `R2` praticables.
