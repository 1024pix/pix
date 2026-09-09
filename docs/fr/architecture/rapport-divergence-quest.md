# Rapport de divergence — contexte `quest`

Constats relevés dans `api/src/quest` sur `dev`, le 2026-09-07.

## Ce que mesure ce document

Les fiches décrivent un **état cible** : celui où l'architecture est rentable. Elles sont génériques et
ne parlent d'aucun contexte. Ce document mesure la **divergence** entre cette cible et le code réel :
chemin du fichier, invariant enfreint, mode de vérification, et ce qu'il faudrait faire.

Trois conséquences de ce cadrage :

- **Une divergence n'est pas une faute.** Elle peut être une convention assumée, une dérive, ou un
  vestige d'une architecture précédente jamais migrée. Les trois se traitent différemment.
- **Ce document se périme, les fiches non.** Chaque constat porte sa date et son mode de vérification.
  Avant de s'appuyer sur l'un d'eux, relire le code.
- **La priorisation ne suit pas la gravité brute** mais la grille coût payé / bénéfice obtenu — voir
  `invariants-clean-archi-ddd.md`. Une cérémonie dont le bénéfice n'est pas obtenu passe avant une
  entorse dont le coût est nul.

Fiches de référence pour les constats ci-dessous : `fiche-repository.md`, `fiche-specification.md`,
`fiche-racine-agregat.md`, `fiche-service-domaine.md`.

---

## Synthèse

| # | Constat | Invariant | Vérifié par | Gravité |
| --- | --- | --- | --- | --- |
| 1 | `CombinedCourseDetails` réinstancie une `Quest` avec des requirements filtrés | S8 | lecture | **bloquant** pour le découpage en deux contextes |
| 2 | 6 fonctions de repository sont des passe-plats vers l'API d'un contexte voisin | I1 | lecture | **régression possible** en production |
| 3 | `organization` fait lever un `TypeError` sur candidat incomplet | S1 | **exécution** | régression silencieuse, avalée par un `try/catch` |
| 4 | `getOrCreateNewOrganizationLearner` cache une règle métier | I10 | lecture | règle invisible depuis le usecase |
| 5 | Un `throw error` laisse remonter une erreur `knex` brute | I4 | lecture | 500 au lieu du code prévu |
| 6 | 3 modèles du domaine importent `logger` depuis l'infrastructure | S3 | lecture | testabilité, et coût d'évaluation |
| 7 | `evaluation` importe directement les usecases de `quest` | CA-2 / DDD-1 | lecture | frontière de contexte franchie hors API |
| 8 | `Object.freeze` qui ne protège rien dans `ObjectRequirement.data` | S4 | lecture | fausse impression de garantie |
| 9 | Champs publics mutables sur `BaseRequirement` | S4 | lecture | objet-valeur modifiable de l'extérieur |
| 10 | `combined-course-blueprint-repository.js` absent de l'index | I6 | lecture | l'index n'est plus la carte du contexte |
| 11 | `aggregates/` contient des read-models | DDT-1 | lecture | le mot promet une garantie inexistante |
| 12 | `domain/services/` contient un usecase | DDT-6 | lecture | idem |
| 13 | Un bug d'interpolation dans un message d'erreur | — | lecture | diagnostic impossible en production |
| 14 | Trois écarts entre la doc Confluence et le code | S6 | lecture | les auteurs de quêtes suivent une doc fausse |

Une hypothèse a été **réfutée** en vérifiant — voir la section correspondante en fin de document.
Elle est conservée parce qu'elle documente la méthode.

---

## 1. Le parcours combiné redéfinit la specification — S8

**Constat.** `CombinedCourseDetails.isSuccessful()` retire des requirements puis réinstancie une
`Quest` :

```js
// quest/domain/models/combined-course-participations/aggregates/CombinedCourseDetails.js
const successRequirements = this.quest.successRequirements.filter((r) => /* … */);
const quest = new Quest({ ...this.quest, successRequirements });
return quest.isSuccessful(this.dataForQuest);
```

Il lit aussi la forme interne du DSL sur trois niveaux, et évalue des feuilles isolées :

```js
.map(({ data }) => data.campaignId.data)
requirement.data.moduleId.data
requirement.isFulfilled(dataForQuest)
```

**Pourquoi c'est le constat le plus structurant.** Aucune API publiée ne peut exposer « réinstancie
mon agrégat avec d'autres requirements ». Tant que ce point tient, `quest` et les parcours combinés
ne peuvent pas devenir deux contextes bornés distincts.

**Le comportement métier derrière est légitime** : un module recommandable non recommandé ne doit pas
bloquer la complétion du parcours. Mais il est *émergent*, produit par un filtrage de requirements.

**Ce qu'il faudrait faire.**

`QuestInput` est déjà la bonne amorce — c'est la seule couche qui traduit entre le vocabulaire local
(`items: [{type, value, shortId}]`) et le DSL, dans les deux sens. Trois choses lui manquent :

1. elle ne couvre que l'écriture d'un blueprint ; le chemin de lecture à l'exécution ne passe pas par
   elle ;
2. `itemsFromQuest` lit `data.targetProfileId.data` (niveau blueprint) quand
   `CombinedCourseDetails.campaignIds` lit `data.campaignId.data` (niveau instance) — deux
   implémentations divergentes de la même traduction ;
3. elle déborde : `toQuest()` délègue à `CombinedCourseBlueprint.buildRequirementForCombinedCourse`,
   et `itemsFromQuest` a besoin de `modulesById` pour compléter.

Étapes, dans l'ordre :

- **court terme** — faire passer `CombinedCourseDetails` par `QuestInput` pour obtenir ses items, au
  lieu de parcourir les requirements. Supprime les points 1 et 2.
- **moyen terme** — les items deviennent des données possédées par le parcours combiné, et non
  dérivées de la quête. Le « non affiché mais ne bloque pas la complétion » devient une propriété
  explicite de l'item.
- **puis** — découpage en deux contextes, avec une règle `dependency-cruiser` qui interdit au
  parcours combiné d'importer `Quest`.

Bénéfice de bord : la feature d'avancement dans PixOrga (notes de juin 2025) a besoin d'items
interrogeables, pas dérivés d'un blob JSON à la lecture.

---

## 2. Six passe-plats de repository — I1

**Constat.** Trois fichiers, six fonctions qui renvoient le DTO d'un contexte voisin sans le traduire.

```js
// quest/infrastructure/repositories/user-repository.js
export async function findById({ userId, userApi }) {
  const users = await userApi.getActiveByUserIds({ userIds: [userId] });
  return users ? users[0] : null;          // DTO de identity-access-management, tel quel
}
```

```js
// quest/infrastructure/repositories/campaign-participation-repository.js — 2 fonctions
return campaignParticipationsApi.deleteCampaignParticipations({ ... });
```

```js
// quest/infrastructure/repositories/profile-reward-repository.js — 3 fonctions
export const getByUserId = async ({ userId, profileRewardApi }) => {
  return profileRewardApi.getByUserId(userId);
};
```

Le même fichier contient un contre-exemple conforme, ce qui montre que l'invariant se vérifie **par
fonction** et non par fichier :

```js
// profile-reward-repository.js — getByQuestAndUserId
return new QuestResult({ id: quest.id, obtained: true, profileRewardId: profileRewardForQuest.id, reward });
```

**Ce qui casse.** `startCombinedCourse` lit `user.firstName` et `user.lastName` sur un objet dont la
forme est décidée par `identity-access-management`. Un renommage de champ là-bas casse `quest` à
l'exécution, et `dependency-cruiser` reste vert. La fuite traverse ensuite le usecase :

```js
// quest/domain/usecases/start-combined-course.js
const user = await userRepository.findById({ userId });
await combinedCourseParticipantRepository.getOrCreateNewOrganizationLearner({
  organizationLearner: { firstName: user.firstName, lastName: user.lastName },
});
```

**Ce qu'il faudrait faire.** Un objet-valeur local par usage, construit dans le repository. Pour
`user-repository`, un `QuestUser` avec les seuls champs consommés. Attention au piège : envelopper le
DTO dans une classe aux mêmes champs satisferait un lint sans rien régler — la forme de l'autre
contexte resterait dans le domaine.

Corollaire de diagnostic : ces six fonctions n'ont rien à tester en unitaire, ce que les règles de
test de `quest/CLAUDE.md` exigent pourtant pour un repository adossé à une API. Le test absent est le
symptôme.

---

## 3. `organization` fait lever sur candidat incomplet — S1

**Mesuré par exécution le 2026-09-07**, chaque type de `TYPES.OBJECT` évalué contre
`new DataForQuest({ eligibility: new Eligibility({}) })` :

```
eligibility.organizationLearner = {}
eligibility.organization        = undefined

OK   organizationLearner    -> false
LEVE organization           -> TypeError: Cannot read properties of undefined (reading 'id')
OK   campaignParticipations -> false
OK   passages               -> false
```

**Un seul type sur quatre lève**, et la raison rend le correctif difficile à contester :

```js
// quest/domain/models/quests/aggregates/Eligibility.js
this.organizationLearner = { id: organizationLearner?.id };  // projection : toujours un objet
this.organization = organization;                            // valeur brute : peut être undefined
this.campaignParticipations = campaignParticipations;        // défaut = []
this.passages = passages.map(/* … */);                       // défaut = []
```

La totalité est **déjà appliquée** à `organizationLearner`, délibérément. Il existe donc un précédent
interne, deux lignes au-dessus.

Trois modes de réponse coexistent pour la même erreur de câblage : `TypeError`, `false` par
projection, `false` par collection vide.

**Ce qui casse.** `rewardUser` s'exécute dans `completeAssessment` et enveloppe tout dans un
`try/catch` qui journalise. Le `TypeError` est donc avalé : l'apprenant ne reçoit pas sa récompense,
l'API répond normalement, et seul un log en garde la trace.

**Ce qu'il faudrait faire.** Écrire le test de totalité de `fiche-specification.md` § 6 — il ne
remonte qu'une violation, donc test et correctif tiennent dans la même PR. Puis donner à
`organization` la même garantie de forme qu'à `organizationLearner`.

---

## 4. `getOrCreateNewOrganizationLearner` cache une règle métier — I10

**Constat.**

```js
// quest/infrastructure/repositories/prescription/combined-course-participant-repository.js
export async function getOrCreateNewOrganizationLearner({ organizationLearner, userId, organizationId }) {
  const existingOrganizationLearner = await findOrganizationLearner({ userId, organizationId });
  if (existingOrganizationLearner) {
    if (existingOrganizationLearner.isDisabled) {
      await knexConnection('organization-learners').update({ isDisabled: false })...
    }
    return _toDomain({ id: existingOrganizationLearner.id });
  }
  // sinon insertion
}
```

« Rejoindre un parcours combiné réactive un apprenant désactivé » est une décision métier. Elle est
invisible depuis `startCombinedCourse`, et le nom `getOrCreate*` n'annonce ni l'écriture, ni la
condition, ni la réactivation.

**À noter pour la mesure** : le reste du fichier est conforme. `_toDomain` est appliqué partout (I1),
`findOrganizationLearner` renvoie `null` (I3). Un fichier peut être irréprochable sur huit invariants
et porter la règle la plus mal placée du contexte.

**Ce qu'il faudrait faire.** Sortir la réactivation dans le usecase, et scinder en deux opérations de
repository nommées pour ce qu'elles font. Le signal générique — un préfixe de lecture sur une
fonction qui écrit — est détectable, voir `fiche-repository.md` § 6.

---

## 5. Une erreur `knex` brute remonte — I4

**Constat.** Dans le même fichier, le `catch` traduit une contrainte puis relâche le reste :

```js
if (knexUtils.isUniqConstraintViolated(error) && error.constraint === 'one_active_organization_learner') {
  throw new OrganizationLearnersCouldNotBeSavedError(...);
}
throw error;   // toute autre violation de contrainte remonte brute
```

**Ce qui casse.** `http-error-mapper-configuration.js` associe les erreurs du domaine aux codes HTTP.
Seule la contrainte `one_active_organization_learner` est couverte ; toute autre contrainte de la
table produit une 500.

**Ce qu'il faudrait faire.** Une erreur de domaine générique pour les violations de contrainte non
reconnues, plutôt qu'un `throw error`.

---

## 6. Trois modèles du domaine importent l'infrastructure — S3

**Constat.**

```
quest/domain/models/quests/entities/Quest.js               → shared/infrastructure/utils/logger.js
quest/domain/models/quests/value-objects/Requirement.js    → shared/infrastructure/utils/logger.js
quest/domain/models/quests/value-objects/CriterionProperty.js → shared/infrastructure/utils/logger.js
```

`Quest.isEligible` et `isSuccessful` journalisent en `debug` à chaque appel, `ComposedRequirement` et
`ObjectRequirement` aussi.

**Ce qui casse.** La specification devient intestable sans l'infrastructure, et son coût d'évaluation
dépend du niveau de log configuré. Sur un balayage de toutes les quêtes à chaque fin d'assessment,
c'est directement le sujet de performance que la documentation d'équipe identifie comme la limitation
principale du moteur.

**Ce qu'il faudrait faire, et c'est une décision, pas une correction.** La journalisation est utile
sur un moteur difficile à déboguer. La sortie propre n'est pas de la supprimer mais de la faire
remonter à l'appelant : une trace d'évaluation rendue avec le résultat, plutôt qu'un logger importé
dans le modèle. À trancher avant d'activer la règle `dependency-cruiser` correspondante, qui sortira
ces trois violations.

---

## 7. `evaluation` importe les usecases de `quest` — CA-2 / DDD-1

**Constat.**

```js
// api/src/evaluation/application/assessments/assessment-controller.js:6
import { usecases as questUsecases } from '../../../quest/domain/usecases/index.js';
```

Un contrôleur d'un contexte appelle le domaine d'un autre, sans passer par une API interne. Cet index
tire tout `quest` : 22 repositories et les 13 APIs internes des voisins. Le contrôleur d'`evaluation`
dépend donc des parcours combinés pour délivrer une attestation.

`dependency-cruiser` laisse passer, parce que ses règles sont au grain du **contexte** et non de la
**couche**.

**Deux détails relevés au passage :**

- L'import est **commenté** dans `answer-controller.js` — trace du déplacement du déclencheur.
- L'appel dans `completeAssessment` est derrière le toggle `isQuestEnabled` ; celui du chemin
  démo/preview (`saveAndCorrectAnswerForDemoAndPreview`) ne l'est pas.

Et il existe **deux `rewardUser`** : celui de `quest` qui évalue, celui de `profile` qui persiste.
Même nom, deux contextes, sens différents — comportement attendu en DDD, mais à connaître.

**Ce qu'il faudrait faire.** Une API interne `quest/application/api/` exposant le déclenchement, et
la règle `dependency-cruiser` au grain de la couche décrite dans `fiche-repository.md` § 6. Attention
à l'ordre : cette règle ne peut pas être activée avant que le câblage de `domain/usecases/index.js`
soit traité, sinon elle sort sur du code conforme à la convention Pix actuelle.

---

## 8. Un `Object.freeze` qui ne protège rien — S4

**Constat.**

```js
// quest/domain/models/quests/value-objects/Requirement.js — ObjectRequirement
get data() {
  return Object.freeze(this.#criterion).data;
}
```

`Object.freeze` n'affecte pas les champs `#private` — ce ne sont pas des propriétés. Et
`Criterion.data` construit un objet neuf, non gelé, à chaque appel. Ce `freeze` ne protège rien tout
en donnant l'apparence d'une protection, ce qui est plus coûteux que son absence.

**Ce qu'il faudrait faire.** Le retirer, ou geler l'objet réellement rendu. Détectable
syntaxiquement : un `Object.freeze(x)` dont la cible n'a que des champs privés.

---

## 9. Champs publics mutables sur `BaseRequirement` — S4

**Constat.**

```js
// quest/domain/models/quests/value-objects/Requirement.js
class BaseRequirement {
  requirement_type;
  comparison;
```

`requirement.requirement_type = 'autre-chose'` est possible depuis l'extérieur, sur un objet censé
être immuable. Le reste de la famille est correct : état en `#`, exposition en lecture seule.

**Ce qu'il faudrait faire.** Passer en champs privés avec accesseurs en lecture. Impact à mesurer :
`requirement_type` est lu depuis `CombinedCourseDetails`, donc le constat 1 doit être traité d'abord
ou en même temps.

---

## 10. Un repository absent de l'index — I6

**Constat.** `combined-course-blueprints/combined-course-blueprint-repository.js` ne figure pas dans
`repositoriesWithoutInjectedDependencies` de `infrastructure/repositories/index.js`. Il est injecté un
niveau plus haut, directement dans `domain/usecases/index.js`. Seul cas dans `quest`.

**Ce qui casse.** Rien à l'exécution. Mais l'index cesse d'être la liste exhaustive des ports du
contexte, donc toute lecture d'ensemble devient fausse — pour un humain comme pour un agent.

**Ce qu'il faudrait faire.** L'inscrire dans l'index, et écrire le script de complétude de
`fiche-repository.md` § 6 pour que le cas ne se reproduise pas.

---

## 11. `aggregates/` contient des read-models — DDT-1

**Constat.** `quest` est le seul contexte de `api/src` à matérialiser le vocabulaire tactique DDD
dans son arborescence — recherche de `value-objects` dans `api/src` : 5 résultats, tous dans `quest`.
C'est un atout, et c'est pour cette raison que l'écart se voit.

`domain/models/quests/aggregates/` contient `DataForQuest`, `Eligibility` et `Success`.

```js
// Eligibility.js — champs publics, mutables, aucune validation, aucune identité
this.organization = organization;
this.campaignParticipations = campaignParticipations;
```

```js
// CombinedCourseDetails — construit par des mutateurs appelés de l'extérieur
await combinedCourseDetails.setEncryptedUrl();
combinedCourseDetails.setItems({ campaigns, modules });
combinedCourseDetails.setRecommandableModuleIds(recommendableModuleIds);
```

**Nuance importante, et elle change le verdict.** Ce ne sont pas des agrégats ratés : dans le cadre
Specification, `Eligibility`, `Success` et `DataForQuest` sont le **candidat** évalué. Le concept est
juste, le nom du dossier est faux. Il faut renommer, pas repenser.

`Quest`, en revanche, est une vraie racine d'agrégat et a bien sa place dans `entities/`.

**Ce qu'il faudrait faire.** Renommer le dossier pour ce qu'il contient — `evaluation-context/` ou
équivalent. Coût faible, et ça retire une promesse non tenue.

---

## 12. `domain/services/` contient un usecase — DDT-6

**Constat.** Le dossier contient un seul fichier,
`domain/services/combined-course-details-service.js`. Il appelle six repositories
(`combinedCourseRepository`, `campaignRepository`, `moduleRepository`, `recommendedModuleRepository`,
`eligibilityRepository`, `profileRewardRepository`) et enchaîne des mutateurs.

Un service de domaine ne fait pas d'I/O : il prend des objets du domaine, il en renvoie. Ce fichier
est de l'orchestration, donc un usecase. Il est d'ailleurs injecté comme dépendance des vrais
usecases, via un `injectDependencies` dédié en tête de `domain/usecases/index.js`.

**Point positif à ne pas perdre** : il ne calcule aucune règle. Il délègue à
`combinedCourseDetails.quest.findCampaignParticipationIdsContributingToQuest(...)`, c'est-à-dire à
l'agrégat. La règle métier est au bon endroit.

**Ce qu'il faudrait faire.** Le déplacer dans `usecases/`, ou acter que `services/` désigne à Pix un
« sous-usecase partagé » et le documenter comme tel. Les deux sont défendables ; le tiers état ne
l'est pas.

---

## 13. Un bug d'interpolation — hors invariant

**Constat.**

```js
// quest/infrastructure/repositories/prescription/combined-course-participant-repository.js
throw new OrganizationLearnersCouldNotBeSavedError(
  `User ${organizationLearner.userId} already inserted into ${organizationLearner.organizationId}`,
);
```

`userId` et `organizationId` sont des paramètres distincts de la fonction. L'appelant
`startCombinedCourse` ne passe que `{ firstName, lastName }` dans `organizationLearner`. Le message
produit littéralement « User undefined already inserted into undefined ».

**Ce qu'il faudrait faire.** Utiliser les paramètres de la fonction. Correction indépendante du reste,
déjà sortie en tâche séparée.

---

## 14. La doc Confluence a divergé du code — S6

**Le code est la source de vérité** — confirmé par l'équipe. L'export de l'espace EDTDT est copié dans
`tmp/doc-quests/`, converti en Markdown dans `tmp/doc-quests/md/` avec un index. Les pages datent de
mars 2025.

**Trois écarts, à corriger côté doc :**

1. **Un exemple que le code refuse.** Page `CriterionProperty`, dernier exemple :
   `{ "status": { "comparison": "one-of", "data": "SHARED" } }`. Le Joi impose `data` en tableau quand
   `comparison` vaut `one-of` : la construction lève `CriterionPropertyError`. Il faut
   `"comparison": "equal"`. L'exemple contredit le texte de la page juste au-dessus.
2. **`LIKE` existe dans `COMPARISONS`, absent de la doc.** Un auteur de quête ne peut pas savoir qu'il
   existe. Soit la doc rattrape, soit le code retire — pas le tiers état.
3. **Le déclencheur d'évaluation a changé.** La page `CappedTubesRequirement` affirme « la validation
   des quêtes est effectué à chaque réponse de l'utilisateur a une épreuve », et toute la
   justification d'aller chercher `targetProfileSkills` repose là-dessus. Dans le code, l'import est
   commenté dans `answer-controller.js` et `rewardUser` est appelé depuis `completeAssessment`. La
   règle reste nécessaire — le cas « campagne 2 pas encore créée » existe toujours — mais sa
   justification écrite est périmée.

**Deux limitations que la doc identifie déjà**, et qui rejoignent nos constats : le couplage du
protocole d'ajout de critère, et l'absence de validation du JSON. À noter cependant que la doc ne
parle que de la non-vérification des **ids** ; le risque décrit à la section suivante n'y est pas.

---

## 15. Un risque latent, pas encore un défaut — S7

**Constat, et c'est le seul de ce document qui ne signale aucun défaut actuel.** `TYPES.OBJECT` et les
getters de `DataForQuest` correspondent **4 pour 4** :

```
TYPES.OBJECT                          DataForQuest
  organizationLearner          ↔        get organizationLearner()
  organization                 ↔        get organization()
  campaignParticipations       ↔        get campaignParticipations()
  passages                     ↔        get passages()
```

Le contrat tient. Mais rien ne le garantit : l'étape « enregistrer dans `TYPES.OBJECT` » est validée
par Joi, l'étape « charger la donnée dans le repository » ne l'est par rien. Un type enregistré sans
donnée derrière produit le constat 3 — `TypeError` ou `false` silencieux selon la propriété.

**Ce qu'il faudrait faire.** Le test de correspondance de `fiche-specification.md` § 6, dix lignes.
Il passe aujourd'hui : c'est un test de non-régression qui verrouille l'étape non protégée.

Le chantier de lazy loading prévu en septembre — « la quest déclarera ce dont elle a besoin » — rend
ce couplage explicite et lu par la machine. À instruire avant, pas après.

---

## Hypothèse réfutée

Conservée parce qu'elle documente la méthode : plusieurs affirmations posées de tête se sont révélées
fausses à la vérification, dans ce chantier comme dans le précédent.

**Hypothèse.** `CombinedCourseDetails` construit `new DataForQuest({ eligibility })` sans `success`,
et son `isSuccessful()` inclut les requirements `CAPPED_TUBES` que `QuestInput` autorise sur un
blueprint. Le chemin `getMasteryPercentageForCappedTubes` déréférencerait donc `#success` à `null`.

**Réfutée.** `update-combined-course-progress.js` est le **seul** appelant de `isSuccessful()`, et il
renseigne `success` sur la ligne précédente :

```js
updatedCombinedCourseDetails.dataForQuest.success = success;
// …
if (updatedCombinedCourseDetails.isSuccessful() && combinedCourse.quest.rewardId) {
```

Le `null` par défaut de `#success` est intentionnel — `DataForQuest` expose un `set success(value)`,
le candidat se construit en deux temps. Ce n'est donc pas un défaut mais une propriété du modèle, et
le test de totalité **ne doit pas** être étendu à ce cas.

---

## Ordre de traitement proposé

Priorisé par la grille coût/bénéfice, pas par gravité brute.

**Sans décision préalable, effet immédiat :**

1. Constat 3 — test de totalité + correctif sur `organization`. Une seule violation, un précédent
   interne deux lignes au-dessus.
2. Constat 15 — test de correspondance `TYPES.OBJECT` ↔ `DataForQuest`. Dix lignes, non-régression.
3. Constat 10 — inscrire le repository manquant, puis le script de complétude d'index.
4. Constat 13 — le bug d'interpolation.
5. Constat 8 — retirer le `Object.freeze` inopérant.
6. Constat 14 — corriger les trois écarts de la doc.

**Décision d'équipe requise avant d'agir :**

7. Constat 6 — que devient la journalisation dans les modèles.
8. Constat 12 — `services/` déplacé, ou son sens documenté.
9. Constat 11 — nom du dossier `aggregates/`.
10. Constat 5 — quelle erreur de domaine pour une contrainte non reconnue.

**Chantiers longs :**

11. Constat 2 — les six passe-plats, un objet-valeur local par usage.
12. Constat 4 — sortir la réactivation dans le usecase.
13. Constat 7 — API interne pour le déclenchement, puis règle au grain de la couche.
14. Constat 1 — items possédés par le parcours combiné, puis découpage en deux contextes. C'est le
    seul qui débloque le reste.
