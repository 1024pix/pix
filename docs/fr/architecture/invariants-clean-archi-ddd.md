# Clean Archi et DDD à la sauce Pix — écarts avec la théorie

État des lieux au 2026-09-07, établi en lisant le code de `api/src/quest` sur `dev`.

Objectif de ce document : lister les écarts entre ce que décrivent Clean Architecture et DDD, et ce
qui est réellement pratiqué.

## Trois catégories, pas deux

- **Convention** — choix Pix cohérent, à documenter et à faire respecter.
- **Dérive** — personne ne l'a décidé, ça s'est installé.
- **Vestige** — **correct sous l'architecture précédente, jamais migré.**

La troisième catégorie a été ajoutée le 2026-09-07 et elle change le verdict sur plusieurs écarts.
Elle a un fondement documentaire précis.

**Pix vient de la Clean Architecture d'Uncle Bob ; les contextes bornés sont arrivés par-dessus.**
ADR 46 (2023-05-05) : « L'architecture de l'API est inspirée par la Clean architecture ». ADR 51
(2023-07-20) en fait une **contrainte** du refactoring d'arborescence — « Respecter la Clean
Architecture Pix » — et rejette sa solution 1 au motif qu'elle la modifiait. ADR 55 (2024-03-26)
cite le billet d'Uncle Bob et décide les APIs internes.

Conséquence : le triplet `domain/` `application/` `infrastructure/` répliqué dans les 19 contextes
n'est pas une invention DDD, c'est de la Clean Architecture **préservée par contrainte** à travers la
migration. Un jeu de couches unique dans `api/lib` est devenu dix-neuf jeux.

**Et les décisions Pix valent explicitement vers l'avant.** ADR 20 : « Pas de reprise systématique de
l'existant ». ADR 51 : « les différentes équipes devront migrer pas à pas les fichiers de lib vers la
nouvelle arborescence ». Les écarts hérités sont donc **attendus**, pas accidentels.

Pourquoi la distinction compte pour la grille coût/bénéfice : une dérive est une correction à faire,
un vestige est une **migration à finir**. Et un vestige ne paie pas un coût sans bénéfice par
négligence — c'est un report délibéré. La question devient : ce report est-il encore le bon choix ?

Repères chiffrés pour situer l'avancement. ADR 51 recense 157 modèles, 280 usecases et 133
repositories à plat dans `api/lib`. La page Tech Days du 30 juillet 2024 note « environ 155 routes
encore sur lib », avec un plan explicite : « on migre un repository, services, etc. seulement
lorsqu'ils sont utilisés dans un seul contexte ; ceux utilisés dans plusieurs contextes sont laissés
dans lib ». **`api/lib` n'existe plus aujourd'hui** — son reliquat multi-contexte est donc allé
ailleurs, et c'est précisément ce qu'est `src/shared/`.

L'évaluation des moyens de vérification déterministe fait l'objet des fiches par type de fichier.

## Choix du contexte de référence

`quest` reste le contexte de référence, malgré les travaux en cours. Raison factuelle :
**c'est le seul contexte de `api/src` qui matérialise le vocabulaire tactique de DDD dans
l'arborescence.**

```
recherche des dossiers value-objects dans api/src : 5 résultats, tous dans quest/
  quest/domain/models/combined-course-blueprints/value-objects
  quest/domain/models/combined-course-participations/value-objects
  quest/domain/models/combined-courses/value-objects
  quest/domain/models/prescription/value-objects
  quest/domain/models/quests/value-objects
```

Tous les autres dossiers de `api/src` ont un `domain/models/` plat, sans distinction entité /
objet-valeur / agrégat. Un contexte plus stable comme `legal-documents` ou `school` sert donc de témoin, pas de
référence : il n'y a rien à y comparer sur le volet tactique, la question ne s'y pose pas.

Deux témoins retenus pour distinguer « spécificité quest » de « convention Pix » :

- `legal-documents` — petit, récent, propre, mais réduit : pas de routes HTTP, pas de sérialiseurs,
  4 modèles, 3 usecases. Utile pour voir la forme cible d'un contexte sans dette.
- `school` — taille moyenne, stable, complet (routes, contrôleurs, sérialiseurs, services,
  read-models). C'est le témoin le plus représentatif.

Sur les travaux en cours dans `quest` : les dossiers temporaires portent le nom du contexte de
destination (`domain/models/prescription/`, `domain/models/profile/`,
`infrastructure/repositories/prescription/`, `infrastructure/repositories/profile/`). Ce n'est pas
du bruit pour l'exercice, c'est la matière première du volet stratégique : ces dossiers sont la trace
visible d'une frontière de contexte mal placée. Ils sont traités comme tels ci-dessous et non écartés.

---

## Volet Clean Architecture

### CA-1. La racine de composition est placée dans le domaine — vestige

Ce que dit la théorie : le domaine ne connaît rien de l'infrastructure. Le câblage se fait dans une
couche externe (main, composition root).

Ce que fait Pix : `domain/usecases/index.js` importe `../../infrastructure/repositories/index.js`.
Un fichier de la couche domaine importe donc explicitement la couche infrastructure.

```
api/src/quest/domain/usecases/index.js
  import { repositories } from '../../infrastructure/repositories/index.js';
```

L'inversion de dépendance est bien réalisée dans les usecases eux-mêmes — ils reçoivent leurs
repositories en paramètres et n'importent rien :

```js
// api/src/quest/domain/usecases/start-combined-course.js
export async function startCombinedCourse({ userId, code, combinedCourseParticipantRepository, ... }) {
```

L'écart porte uniquement sur l'emplacement du fichier de câblage. Le déplacer hors de `domain/`
serait un renommage mécanique, sans effet sur le code métier.

**Reclassé en vestige le 2026-09-07.** Dans `api/lib`, il y avait **un** `domain/usecases/index.js`.
ADR 51 a répliqué la structure par contexte sous contrainte de préserver la Clean Architecture : on a
donc dix-neuf racines de composition dans dix-neuf domaines, mécaniquement. Personne n'a décidé de
mettre le câblage dans le domaine — c'était déjà le cas, et la migration l'a dupliqué.

### CA-2. Le domaine importe l'infrastructure d'autres contextes — dérive

Le même `domain/usecases/index.js` importe trois repositories qui appartiennent à d'autres contextes :

```
api/src/quest/domain/usecases/index.js
  ../../../prescription/organization-learner/infrastructure/repositories/organization-learner-repository.js
  ../../../team/infrastructure/repositories/membership.repository.js
  ../../../shared/infrastructure/repositories/organization-feature-repository.js
```

C'est le cumul de deux écarts : le domaine atteint de l'infrastructure (CA-1), et il franchit une
frontière de contexte ailleurs que par l'API publiée (DDD-1).

Point important : **`dependency-cruiser` laisse passer.** `prescription/organization-learner`, `team`
et `shared` figurent dans le `dependsOn` de `quest/dependencies.json`. La règle générée est au grain
du contexte, pas de la couche. Rien ne vérifie aujourd'hui qu'une dépendance vers un autre contexte
cible bien son dossier `application/api/`.

### CA-3. Les usecases sont des fonctions à paramètres nommés, pas des objets — convention

La théorie décrit un interactor, souvent une classe, avec ses dépendances au constructeur et une
méthode `execute`.

Pix écrit une fonction exportée dont les dépendances sont mélangées aux données d'entrée dans un
unique objet destructuré. Les dépendances sont ensuite pré-remplies par
`injectDependencies(usecases, dependencies, boundedContext)`
(`api/src/shared/infrastructure/utils/dependency-injection.js`).

Conséquence : rien ne distingue une entrée métier d'une dépendance technique dans la signature.
`{ userId, code, userRepository }` mêle les deux. C'est une convention assumée et généralisée à tous
les contextes, mais elle rend la frontière du usecase illisible pour un outil comme pour un humain.

### CA-4. Une seule couche pour la persistance et pour les autres contextes — convention assumée

Choix d'équipe explicite, pas un écart. Voir DDD-2.

### CA-5. La transaction est implicite — convention

Les repositories récupèrent leur connexion par un ambient context et non par un paramètre :

```js
// api/src/quest/infrastructure/repositories/quests/quest-repository.js
const knexConn = DomainTransaction.getConnection();
```

La théorie passerait une unité de travail explicite. Pix a fait le choix de l'ambient context, ce qui
garde les signatures propres au prix d'un couplage invisible : un usecase ne peut pas savoir, en
lisant sa propre signature, s'il s'exécute dans une transaction.

---

## Volet DDD stratégique

### DDD-1. Deux façons de parler à un autre contexte, contradictoires

La convention Pix est claire : un contexte expose des `application/api/*-api.js` qui renvoient des
DTO, et les autres contextes ne consomment que ça. Elle est respectée à grande échelle —
`infrastructure/repositories/index.js` de `quest` injecte 13 APIs internes :

```
devcomp/…/modules-api.js, recommended-modules-api.js
evaluation/…/knowledge-elements-api.js
identity-access-management/…/users-api.js
learning-content/…/learning-content-api.js, skills-api.js
prescription/campaign/…/campaigns-api.js
prescription/campaign-participation/…/campaign-participations-api.js
prescription/organization-learner/…/organization-learners-api.js,
                                    organization-learners-with-participations-api.js
prescription/target-profile/…/target-profile-api.js
profile/…/profile-reward-api.js, reward-api.js
```

Et contredite au même endroit par les trois imports directs de CA-2. Le contexte
`prescription/organization-learner` est même atteint **des deux façons à la fois** : par son API
(`organizationLearnerApi`, dans l'index des repositories) et par son repository
(`organizationLearnerPrescriptionRepository`, dans l'index des usecases).

Verdict : la règle existe, elle est majoritairement suivie, elle n'est pas outillée.

### DDD-2. Un repository est un port, quelle que soit la source — convention assumée, traduction non tenue

**Choix d'équipe, à ne pas relitiger.** Un contexte voisin est de l'environnement extérieur au même
titre qu'une base de données. Le domaine n'a pas à savoir si la donnée vient de PostgreSQL, d'un
fichier ou de l'API interne d'un autre contexte. Le repository est donc le port unique par lequel le
domaine atteint l'extérieur, et le nom est le bon.

DDD nomme séparément la couche anti-corruption, mais cette distinction porte sur le rôle conceptuel,
pas sur la frontière technique. La lecture port/adaptateur de Clean Architecture les réunit
délibérément.

Cette lecture rend l'invariant réellement attendu **plus net, et non moins** : si le repository est le
port du domaine, alors il doit renvoyer le langage du domaine, quelle que soit la source. Un
repository qui renvoie la forme brute de l'API voisine est exactement aussi fautif qu'un repository
SQL qui renverrait la ligne telle quelle. L'écart ne porte donc pas sur le nom, il porte sur la
traduction — faite une fois sur deux.

Traduction faite :

```js
// api/src/quest/infrastructure/repositories/recommended-module-repository.js
export const findIdsByTargetProfileIds = async ({ targetProfileIds, recommendedModulesApi }) => {
  const recommendedModules = await recommendedModulesApi.findByTargetProfileIds({ targetProfileIds });
  return recommendedModules.map(toDomain);        // → RecommendedModule, objet-valeur de quest
};
```

Traduction absente, le DTO de l'autre contexte entre tel quel dans le domaine de `quest` :

```js
// api/src/quest/infrastructure/repositories/user-repository.js
export async function findById({ userId, userApi }) {
  const users = await userApi.getActiveByUserIds({ userIds: [userId] });
  return users ? users[0] : null;
}
```

```js
// api/src/quest/infrastructure/repositories/campaign-participation-repository.js
export async function deleteCampaignParticipations({ ..., campaignParticipationsApi }) {
  return campaignParticipationsApi.deleteCampaignParticipations({ ... });   // passe-plat intégral
}
```

Effet mesurable : `startCombinedCourse` lit `user.firstName` et `user.lastName` sur un objet dont la
forme est décidée par `identity-access-management`. Un renommage de champ dans ce contexte casse
`quest` sans qu'aucune règle de dépendance ne bouge.

C'est l'écart le plus intéressant du lot : il est net, il est fréquent, et il est le seul à porter un
risque de régression réel plutôt qu'un désagrément de lecture.

Avantage de la lecture uniforme du repository comme port : la règle à vérifier ne demande pas de
distinguer les repositories adossés à la base de ceux adossés à une API voisine. Un seul énoncé
couvre les deux — un repository renvoie un type du domaine local, point.

### DDD-3. La frontière de contexte est instable, et le dossier temporaire l'acte

`quest` héberge des modèles et des repositories qui appartiennent à `prescription` et à `profile` :

```
domain/models/prescription/entities/OrganizationLearner.js
domain/models/prescription/value-objects/VerifiedCode.js
domain/models/profile/entities/Attestation.js
infrastructure/repositories/prescription/combined-course-participant-repository.js
infrastructure/repositories/profile/attestation-repository.js
```

Le `README.md` du contexte le dit explicitement :

> Discussions are in progress between the Quest and Prescription teams to redefine and join some
> concepts common to both contexts (campaigns/combined-courses, target profile/blueprint, ...)

Ce n'est pas un écart à corriger, c'est un travail en cours correctement signalé. À noter tout de
même : rien dans l'outillage ne distingue un dossier temporaire d'un dossier définitif, et rien ne
périme la situation. Un marqueur explicite serait le premier candidat à une vérification
déterministe utile.

### DDD-4. Le langage ubiquitaire n'est pas partagé entre contextes voisins

`quest` définit ses propres `Campaign`, `TargetProfile`, `OrganizationLearner`, `Module`, qui
existent déjà sous ces noms dans `prescription` et `devcomp`. C'est exactement ce que DDD prescrit —
un même mot peut désigner deux choses dans deux contextes — mais la conséquence pratique est qu'un
import de type ou une lecture de code demande de savoir de quel `Campaign` on parle.

Aucun préfixe ni suffixe ne les distingue. `quest/domain/models/combined-courses/value-objects/Campaign.js`
et le `Campaign` de `prescription` se ressemblent au point que l'erreur d'import ne se voit pas en
relecture.

### DDD-5. Le contexte `shared` est une porte de sortie universelle — vestige, et il est documenté

Tous les contextes dépendent de `shared`, qui contient du domaine (`DomainTransaction`, `errors.js`,
`access-code-generator`), de l'infrastructure (`organization-feature-repository`,
`access-code-repository`) et des utilitaires. `shared` n'est pas un contexte borné : c'est
l'emplacement où va ce qui n'a pas trouvé sa place. Toute règle de frontière est contournable en
passant par lui.

**Reclassé en vestige le 2026-09-07, et ce n'était pas une découverte de ma part.** Le plan de
migration des Tech Days 2024 est explicite : on ne migre hors de `lib` que ce qui sert à **un seul**
contexte ; le multi-contexte reste en arrière. `shared/` est donc l'état terminal de cette règle, par
construction.

Et ADR 55 le décrit déjà, avec ses conséquences négatives énumérées :

> Ce code partagé est actuellement placé dans différents dossiers nommés `shared` quand il a été
> identifié comme mélangeant plusieurs contextes fonctionnels.

L'ADR liste surcharge cognitive, allongement des délais, perte d'engagement et perte d'autonomie des
équipes. Le constat est donc **acquis depuis mars 2024** ; ce qui manque n'est pas le diagnostic mais
l'avancement. Reformuler cet écart comme une découverte serait malhonnête.

---

## Volet DDD tactique

### DDT-1. Le découpage entités / objets-valeurs / agrégats existe mais n'est pas porté par le code

`quest` range ses modèles dans `entities/`, `value-objects/`, `aggregates/`, `events/`. Le dossier
annonce l'intention, il ne la garantit pas.

Un objet-valeur est par définition immuable et sans identité. `Criterion.js` et `Requirement.js`
s'en approchent : état en champs privés `#`, exposition en lecture seule, `Object.freeze` sur les
collections renvoyées.

```js
// api/src/quest/domain/models/quests/value-objects/Requirement.js
get data() {
  return Object.freeze(this.#subRequirements);
}
```

Mais les agrégats, eux, n'ont rien d'un agrégat au sens DDD :

```js
// api/src/quest/domain/models/quests/aggregates/Eligibility.js
export class Eligibility {
  constructor({ organizationLearner, organization, campaignParticipations = [], passages = [] }) {
    this.organizationLearner = { id: organizationLearner?.id };
    this.organization = organization;      // champs publics, mutables, aucune validation
```

`Eligibility` est un sac de données de lecture, sans identité, sans invariant, sans racine. C'est un
read-model. Le rangement en `aggregates/` désigne autre chose que ce que le mot veut dire, ce qui est
plus coûteux que l'absence de rangement : il fait croire à une garantie inexistante.

### DDT-2. Trois protections d'invariant différentes coexistent dans le même contexte

| Modèle | Protection |
| --- | --- |
| `quests/entities/Quest.js` | Joi dans un `#validate()` privé, appelé **avant** l'affectation des champs |
| `combined-courses/entities/CombinedCourse.js` | Joi dans un `#validate()` privé, appelé **après** l'affectation des champs, sur `this` |
| `quests/aggregates/Eligibility.js` | aucune |

L'ordre n'est pas un détail. Dans `CombinedCourse`, l'objet est intégralement construit puis validé :

```js
this.baseSurveyUrl = baseSurveyUrl;
this.#validate();          // valide this, donc après coup
```

Dans `Quest`, la validation précède la construction :

```js
this.#validate({ rewardType, rewardId, eligibilityRequirements, successRequirements });
this.rewardType = rewardType;
```

Les deux lèvent `EntityValidationError.fromJoiErrors`, donc l'effet observable est le même
aujourd'hui. L'écart est une incohérence de convention, pas un bug.

À signaler pour la comparaison : la majorité des contextes n'ont **aucune** validation dans leurs
modèles. `organizational-entities/domain/models/Organization.js` est un constructeur destructuré
avec `= {}` par défaut, tous les champs optionnels, zéro validation. `quest` est donc en avance sur
ce point, pas en retard.

### DDT-3. Le modèle de domaine expose sa forme de persistance

`Quest.toDTO()` produit la structure attendue par la table :

```js
// api/src/quest/infrastructure/repositories/quests/quest-repository.js
eligibilityRequirements: quest.eligibilityRequirements
  ? JSON.stringify(quest.toDTO().eligibilityRequirements)
  : [],
```

Le domaine porte donc une méthode dont le seul consommateur est l'infrastructure, et dont la forme
est dictée par le format de stockage.

**Correction du 2026-09-07.** J'avais écrit que le champ `requirement_type` en snake_case dans
`Requirement.js` était « la trace de la colonne SQL remontée jusque dans le modèle ». **C'est faux.**
Les présentations d'équipe l'établissent : `requirement_type` est le **nom d'une propriété de
`DataForQuest`**, résolue dynamiquement à l'évaluation (`dataInput[this.requirement_type]` dans
`ObjectRequirement.isFulfilled`). Ce n'est pas une colonne, c'est une clé de résolution tardive dans
un contexte d'évaluation.

Et le snake_case n'est pas une négligence : le JSON d'une quest est un **contrat externe** écrit à la
main par les auteurs de quests, documenté sur Confluence (« Syntaxe quête », « Guide de création d'une
quête »). Le renommer pour l'aligner sur les conventions internes casserait les quests existantes et
la documentation. **L'invariant correct est l'inverse de ce que je suggérais** : le format JSON d'une
quest est un format publié, il ne se renomme pas pour des raisons de style.

Ce qui reste vrai de DDT-3 : `Quest.toDTO()` produit la forme de stockage et n'a que
l'infrastructure pour consommateur. Mais c'est ici la sérialisation d'un contrat externe, ce qui est
une justification bien plus solide qu'une fuite de schéma. À reclasser en **convention assumée**
plutôt qu'en dérive, une fois vérifié que la forme de `toDTO()` correspond bien à la syntaxe
documentée et non à un format dérivé.

### DDT-4. Un objet-valeur pour chaque intention d'écriture — convention, et c'est une bonne

`combined-course-blueprints/value-objects/` contient `CombinedCourseBlueprintForCreation.js` et
`CombinedCourseBlueprintForUpdate.js`, distincts de l'entité `CombinedCourseBlueprint.js`.

Ce n'est pas dans les livres sous ce nom, mais c'est un pattern sain : l'entrée d'une commande est
typée séparément de l'entité persistée. À retenir comme convention à généraliser plutôt que comme
écart à corriger. Le pendant en lecture est `read-models/` (`school`) ou `dtos/`
(`organizational-entities`), et là le vocabulaire n'est pas stabilisé — trois noms pour la même idée
selon le contexte.

### DDT-5. Le repository n'est pas au grain de l'agrégat

DDD associe un repository à une racine d'agrégat. `quest` a 22 repositories pour 6 familles de
modèles. `CombinedCourse` porte `participations` dans son état, et `CombinedCourseParticipation` a
son propre repository : les deux sont donc racine, ce qui vide la notion de son sens.

Le découpage réel suit les besoins de requêtage, pas les frontières de cohérence. C'est un choix
tenable, mais il faut alors renoncer au mot « agrégat » plutôt que le laisser sur un dossier.

### DDT-6. `domain/services/` contient de l'orchestration, pas des services de domaine — dérive

Un service de domaine, en DDD, porte une règle qui ne relève d'aucun agrégat : il prend des objets du
domaine, il en renvoie, et **il ne fait aucune I/O**.

`quest/domain/services/` contient un seul fichier, `combined-course-details-service.js`. Il appelle
six repositories (`combinedCourseRepository`, `campaignRepository`, `moduleRepository`,
`recommendedModuleRepository`, `eligibilityRepository`, `profileRewardRepository`) et enchaîne des
mutateurs sur `CombinedCourseDetails` :

```js
const combinedCourse = await combinedCourseRepository.getById({ id: combinedCourseId });
await combinedCourseDetails.setEncryptedUrl();
combinedCourseDetails.setItems({ campaigns, modules });
combinedCourseDetails.setRecommandableModuleIds(recommendableModuleIds);
```

C'est un usecase, placé dans `services/`. Il est d'ailleurs injecté comme une dépendance des vrais
usecases, via un `injectDependencies` dédié en tête de `domain/usecases/index.js`.

Deux observations qui en découlent :

- **Le découpage usecase / service n'est pas fondé sur la nature du code**, mais sur le besoin de
  réutiliser une orchestration entre plusieurs usecases. Le mot « service » désigne donc ici un
  sous-usecase partagé. Convention défendable, nom trompeur.
- **La règle métier, elle, est au bon endroit.** Le service ne calcule rien : il délègue à
  `combinedCourseDetails.quest.findCampaignParticipationIdsContributingToQuest(dataForQuest)`.
  `Quest.js` porte bien ses invariants, ce qui confirme que la racine d'agrégat fonctionne dans ce
  contexte quand on la laisse travailler.

Ce cas renforce DDT-1 : `CombinedCourseDetails` est rangé dans `aggregates/` et se construit par une
séquence de mutateurs appelés de l'extérieur. C'est un constructeur progressif, pas un agrégat qui
protège une frontière de cohérence.

---

## Coût payé, bénéfice obtenu ?

Grille de lecture principale, qui prime sur le classement *convention / dérive* des sections
précédentes. Une architecture a un coût censé être amorti par ses avantages ; s'en éloigner sans
renoncer à la cérémonie, c'est garder le coût sans le bénéfice. Le classement *convention assumée*
peut d'ailleurs masquer ce cas précis — on paie, on a décidé de payer, et on n'obtient rien.

### Coût payé, bénéfice absent — à traiter en priorité

| Sujet | Ce qu'on paie | Ce qu'on devrait obtenir | Ce qu'on obtient |
| --- | --- | --- | --- |
| **`aggregates/`** (DDT-1) | une arborescence à quatre niveaux, un choix de dossier à chaque nouveau modèle, des chemins d'import plus longs | la garantie qu'un invariant est tenu à une frontière de cohérence | **rien**. `Eligibility` est un sac de champs publics mutables sans identité ; `CombinedCourseDetails` se construit par des mutateurs appelés de l'extérieur. Le mot promet une garantie inexistante, ce qui est plus coûteux que l'absence de rangement |
| **Les 6 passe-plats** (DDD-2) | un fichier, une inscription dans l'index, une injection de dépendance, un test unitaire attendu — par fonction | un domaine indépendant de la forme des voisins | **rien**. Le DTO de `identity-access-management` arrive intact dans `startCombinedCourse`. On paie la couche et on garde le couplage |
| **`domain/services/`** (DDT-6) | un dossier et une décision de rangement à chaque ajout | une règle qui ne relève d'aucun agrégat, isolée et testable sans I/O | **rien**. Le seul fichier appelle six repositories : c'est un usecase |
| **Les 3 imports d'infrastructure voisine** (DDD-1) | la couche `application/api/` complète de trois contextes, plus leurs DTO | un contrat stable entre contextes | **rien sur ces trois-là**. `prescription/organization-learner` est atteint par son API *et* par son repository |

Le point commun : dans les quatre cas, le coût est déjà payé intégralement. Rien à économiser en
renonçant, tout à gagner en rétablissant — sauf pour `aggregates/` et `domain/services/`, où
supprimer le coût (renommer le dossier pour qu'il dise ce qu'il contient) est aussi valable que
rétablir le bénéfice.

### Coût payé, bénéfice partiel — à aiguiser, c'est peu cher

| Sujet | Bénéfice obtenu | Ce qui l'émousse |
| --- | --- | --- |
| **`dependencies.json` + dependency-cruiser** | réel, la règle sort et bloque la CI | elle est au grain du **contexte**, pas de la **couche**. `quest/domain` importe `prescription/infrastructure` au vert. Une règle de chemin suffit à fermer le trou |
| **`entities/` vs `value-objects/`** | réel sur les objets-valeurs : `Criterion` et `Requirement` ont un état privé `#`, une exposition en lecture seule, `Object.freeze` sur les collections | rien ne l'impose. Un objet-valeur mutable passerait sans bruit. Le dossier est une intention, pas une garantie |
| **Validation dans les modèles** | réel dans `quest` : `Quest` et `CombinedCourse` valident en Joi | incohérence d'ordre (avant vs après affectation), et la majorité des contextes ne valident rien du tout |

### Bénéfice obtenu — à protéger, surtout ne rien casser

| Sujet | Pourquoi ça vaut son coût |
| --- | --- |
| **Inversion de dépendance dans les usecases** | aucun usecase de `quest` n'importe un repository. C'est ce qui rend les usecases lisibles et rejouables |
| **`injectDependencies`** | machinerie astucieuse, mais elle tient sa promesse : I5 est respecté **partout** dans `quest`, aucun repository n'importe une API voisine |
| **APIs internes rendant des DTO** | 13 consommées par `quest`. La convention tient à grande échelle ; les 3 contournements sont l'exception |
| **Règles de test par couche** (`quest/CLAUDE.md`) | et un corollaire de diagnostic gratuit : un repository adossé à une API qui n'a rien à tester en unitaire ne traduit rien, donc viole DDD-2 |
| **Les invariants portés par `Quest.js`** | `isEligible`, `isSuccessful` composent des dizaines de `Requirement` sur la racine. La seule racine d'agrégat du contexte qui fasse son travail |

### Deux façons de mal utiliser cette grille

**La première** : s'en servir pour supprimer une structure encore peu rentable mais bon marché.
`entities/` / `value-objects/` coûte quelques dossiers et fonctionne à moitié — l'aiguiser coûte moins
cher que l'abandonner, et l'abandon se paierait au moment de la migration TypeScript.

**La seconde** : confondre « critiquer l'application d'une décision » et « rouvrir la décision ».
Que le repository soit le port unique du domaine, y compris vers un contexte voisin, est tranché et
ne se rediscute pas. Constater que **6 fonctions ne tiennent pas cette décision** n'est pas la
rouvrir : c'est demander qu'elle produise l'effet pour lequel elle a été prise.

## Ce qui est correct et qu'il faut préserver

À ne pas perdre de vue en formulant des règles : plusieurs points sont déjà tenus et une règle mal
écrite pourrait les défaire.

- L'inversion de dépendance dans les usecases : aucun usecase de `quest` n'importe un repository.
- La déclaration explicite des frontières : `dependencies.json` par contexte, vérifié par
  `dependency-cruiser` dans `npm run lint`.
- Les APIs internes renvoyant des DTO : 13 consommées par `quest`, la convention tient à grande échelle.
- Les règles de test par couche, écrites dans `api/src/quest/CLAUDE.md` : usecases en intégration
  uniquement, modèles en unitaire pur, repositories sur API interne en unitaire avec mock,
  repositories sur base en intégration.
- La documentation du contexte : `README.md` qui nomme les entités cœur et signale explicitement les
  discussions de frontière en cours.

## Sources

Bibliographie et liens dans `references-ddd.md`. Correspondance par famille d'écarts :

| Écarts | Source |
| --- | --- |
| CA-1, CA-2, CA-5 (couches, câblage, inversion) | Martin, « The Clean Architecture » (billet gratuit de 2012) et *Clean Architecture*, ch. « The Dependency Inversion Principle » |
| CA-3, CA-4 (le port, l'usecase) | Cockburn, « Hexagonal Architecture » (gratuit) ; Martin, ch. « Business Rules » |
| DDD-1, DDD-3, DDD-5 (frontières, contexte partagé) | Evans, *DDD*, ch. « Maintaining Model Integrity » — Bounded Context, Context Map, Shared Kernel |
| DDD-2 (traduction entre contextes) | Evans, même ch. — **Anticorruption Layer** ; Vernon, *IDDD*, ch. « Integrating Bounded Contexts » |
| DDD-4 (même mot, deux contextes) | Evans, ch. « Maintaining Model Integrity » — c'est le comportement **attendu**, pas un écart |
| DDT-1, DDT-2, DDT-4 (entité, objet-valeur, validation) | Evans, ch. « A Model Expressed in Software » ; Fowler, « AnemicDomainModel » (gratuit) |
| DDT-3 (format publié) | Evans, ch. « Maintaining Model Integrity » — **Published Language** |
| DDT-5 (grain de l'agrégat) | Vernon, « Effective Aggregate Design » — trois articles gratuits |
| DDT-6 (service de domaine sans I/O) | Evans, ch. « A Model Expressed in Software » — définition du Service |

La **grille coût/bénéfice** de la section précédente n'a pas de source : c'est le critère de
l'équipe, formulé le 2026-09-07. Il prime volontairement sur la conformité aux sources ci-dessus.

Et le tableau « ce qui n'a pas de source » de `references-ddd.md` liste les huit conventions Pix qui
ne viennent d'aucun livre. À consulter avant d'invoquer le DDD pour défendre l'une d'elles.

## Suite

Second document à produire : pour chaque écart ci-dessus, évaluer s'il est vérifiable de manière
déterministe et par quel moyen. Les trois moyens disponibles, par ordre de coût croissant :
règle `dependency-cruiser`, règle ESLint, script AST dans `tests/tooling/`. Le typage ne peut pas
servir : le code est en JavaScript et `tsconfig.json` a `allowJs: false`.

Candidats les plus prometteurs, à instruire d'abord :

1. **CA-2 / DDD-1** — une dépendance vers un autre contexte doit cibler `application/api/`.
   Grain manquant dans les règles `dependency-cruiser` actuelles, qui sont au grain du contexte.
2. **DDD-2** — un repository doit renvoyer un type du domaine local, quelle que soit sa source.
   Détectable sur l'AST : retour direct de la valeur d'un appel externe, sans passage par un
   constructeur ou une fonction de mapping locale. S'applique aussi bien aux repositories adossés à
   la base qu'à ceux adossés à une API voisine.
3. **DDT-1** — un fichier de `value-objects/` ne doit pas exposer de champ public mutable.
   Détectable sur l'AST.
