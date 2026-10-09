# API interne

Une API interne est le contrat publié d'un Bounded Context. Elle vit dans `application/api/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à toute API interne et à tout objet de contrat. La ligne
**Vérification** de chaque invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans
la CI est dans [`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) ·
[Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**P1**](#p1-lapi-expose-un-dto-jamais-un-modèle-du-domaine) | l'API expose un DTO, jamais un modèle du domaine | règle ESLint, partielle, puis typage |
| [**P2**](#p2-lapi-passe-par-un-usecase) | l'API passe par un usecase | `dependency-cruiser` |
| [**P3**](#p3-le-contrat-est-documenté) | le contrat est documenté | script, partiel, sans faux positif |
| [**P4**](#p4-le-dto-ne-porte-aucun-comportement-métier) | le DTO ne porte aucun comportement métier | voir `../objet-valeur/outillage.md` |
| [**P5**](#p5-un-seul-emplacement-pour-lobjet-de-contrat) | un seul emplacement pour l'objet de contrat | script |
| [**P6**](#p6-le-contrat-est-stable) | le contrat est stable | revue |
| [**P7**](#p7-le-comportement-ne-dépend-pas-de-lappelant) | le comportement ne dépend pas de l'appelant | revue |
| [**P8**](#p8-lapi-ne-transite-pas-vers-un-autre-contexte) | l'API ne transite pas vers un autre contexte | `dependency-cruiser` |
| [**P9**](#p9-le-dto-nexpose-que-ce-que-ses-consommateurs-utilisent) | le DTO n'expose que ce que ses consommateurs utilisent | revue |

Hors numérotation : le [sens de lecture](#le-sens-de-lecture-souvent-inversé), qui relie cette page à
`I1` de `../repository/README.md`. La distinction entre objet de contrat et read-model est dans `X1`
de `../read-model/ecarts.md`, pas ici.

---

## Rôle

Une API interne est le **contrat publié** d'un Bounded Context : ce qu'il accepte de faire pour les
autres, et sous quelle forme il leur répond.

Un contexte voisin passe par ce seul point. Le reste du contexte lui est inaccessible : modèles,
usecases, repositories.

Deux propriétés en découlent. Elles sont la raison d'être de la couche :

- le contexte fournisseur reste libre de changer son modèle, sa base et ses usecases, tant que le
  contrat tient ;
- le contexte consommateur reste autonome, sans avoir à connaître le fonctionnement interne du
  voisin.

Termes employés dans cette page :

- **DTO**, ou **objet de contrat** : l'objet que l'API construit pour sa réponse, distinct du modèle
  du domaine.
- **Contexte fournisseur** : le contexte qui écrit et publie l'API.
- **Contexte consommateur** : le contexte qui l'appelle.

### Le sens de lecture, souvent inversé

L'API interne est écrite par le contexte **fournisseur**. Le contexte **consommateur** ne l'appelle pas
directement depuis son domaine. Il la reçoit injectée dans un de ses repositories, qui traduit vers
son propre vocabulaire.

Cette page et `../repository/README.md` se lisent donc ensemble. `P1` décrit ce qui sort de l'API.
`I1` de `../repository/README.md` décrit ce que le voisin doit en faire : le traduire, et non le
laisser entrer intact dans son domaine.

### Ce qu'une API interne n'est pas

Si le code correspond à une ligne, ce n'est pas une API interne.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| est appelé par une requête HTTP | un contrôleur, dans `application/` | `../controleur/README.md` |
| réalise l'intention métier | un usecase | `../usecase/README.md` |
| accède aux données | un repository | `../repository/README.md` |
| consomme l'API d'un voisin | un repository du contexte consommateur | `../repository/README.md` |
| met en forme pour une réponse HTTP | un sérialiseur | `../serialiseur/README.md` |
| réagit à un événement d'un autre contexte | le mécanisme événementiel | hors périmètre du corpus |

---

## Invariants

### P1. L'API expose un DTO, jamais un modèle du domaine

**Énoncé.** Le modèle interne ne franchit pas la frontière. L'API construit un objet dédié au contrat.

```js
// conforme — l'API construit le DTO à partir du résultat du usecase
export const getActiveByUserIds = async ({ userIds }) => {
  const users = await usecases.getActiveByUserIds({ userIds });

  return users.map((user) => new UserDTO(user));
};

// fautif — le modèle du domaine devient le contrat
export const getByUserId = async (userId) => {
  return usecases.getProfileRewardsByUserId({ userId });
};
```

**Code.** Conforme : [`users-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/users-api.js#L39-L43). Fautif : [`profile-reward-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/profile/application/api/profile-reward-api.js#L7-L9).

La forme fautive se reconnaît à sa longueur : une seule ligne, sans `new`. Seule exception : un
usecase qui renvoie un scalaire ou rien, voir les [exceptions légitimes](#exceptions-légitimes). Un
fichier d'API dont toutes les fonctions ont cette forme n'a pas de contrat. Il n'est qu'une liste de
raccourcis vers les usecases du contexte.

**Forme interdite.** Envelopper le modèle dans un DTO aux mêmes champs respecte `P1` à la lettre et le
viole dans son esprit. Le lint passe au vert, et la forme interne reste le contrat. `P9` dit quels
champs le DTO porte.

**Ce qui casse.** Chaque champ du modèle devient une promesse implicite. Un renommage interne casse
les voisins à l'exécution, sans qu'aucune règle de dépendance ne bouge. `dependency-cruiser` reste
vert, parce que la dépendance de module n'a pas changé.

**Vérification.** Une règle ESLint pour le sous-cas le plus simple, et le typage pour la forme du
contrat. Voir [`outillage.md`](outillage.md#p1--détecter-le-modèle-du-domaine-qui-fuit).

### P2. L'API passe par un usecase

**Énoncé.** L'API interne est une porte d'entrée applicative, au même titre qu'un contrôleur. Elle
appelle un usecase, jamais un repository directement.

```js
// conforme à P2 — l'API appelle un usecase, puis construit le DTO
export const getById = async (id) => {
  const targetProfile = await usecases.getTargetProfile({ targetProfileId: id });

  return new TargetProfile(targetProfile);
};

// fautif — court-circuite les règles métier
import * as challengeToPlayRepository from '../../infrastructure/repositories/challenge-to-play-repository.js';

export function get(challengeId) {
  return challengeToPlayRepository.get(challengeId);
}
```

**Code.** Conforme : [`target-profile-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/target-profile/application/api/target-profile-api.js#L42-L46). Fautif : [`challenge-to-play-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/application/api/challenge-to-play-api.js#L11-L13), import à la ligne 1.

Le même fichier fautif expose aussi la configuration de sérialisation du contexte :

```js
import { challengeToPlaySerializer } from '../../infrastructure/serializers/jsonapi/challenge-to-play-serializer.js';

export function getSerializationConfig() {
  return challengeToPlaySerializer.config;
}
```

**Code.** [`challenge-to-play-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/application/api/challenge-to-play-api.js#L21-L23), import à la ligne 2.

Ici, le contrat publié n'expose pas seulement un modèle du domaine. Il expose aussi la configuration
de sérialisation du contexte. Le voisin reçoit de quoi produire lui-même la réponse HTTP, donc le
format de sortie d'un contexte devient une dépendance de l'autre. `P1` n'interdit pas ce cas
explicitement. La règle de `P2` le signale, parce que le sérialiseur est importé depuis
`infrastructure/`.

**Ce qui casse.** Une lecture porte aussi des règles : filtrage des éléments supprimés, droits,
périmètre. Les court-circuiter pour les seuls voisins crée deux comportements pour la même question,
selon qu'elle est posée de l'intérieur ou de l'extérieur du contexte.

**Vérification.** Une règle `dependency-cruiser`. Voir
[`outillage.md`](outillage.md#p2-et-p8--deux-règles-de-chemin).

### P3. Le contrat est documenté

**Énoncé.** Chaque fonction exposée porte sa documentation : ce qu'elle prend, ce qu'elle rend, ce
qu'elle lève. Les types du contrat sont décrits, pas seulement nommés.

Cette documentation est le contrat lui-même. Elle se génère dans un fichier `API.md` à la racine du
contexte. Le consommateur la lit sans ouvrir le code du fournisseur, ce qui est le but de la couche.

```js
// conforme — ce que la fonction prend et ce qu'elle rend sont décrits
/**
 * @function
 * @name getActiveByUserIds
 *
 * @param {Object} params
 * @param {Array<Number>} params.userIds
 * @returns {Promise<Array<UserDTO>>}
 */
export const getActiveByUserIds = async ({ userIds }) => { … };

// fautif — aucune documentation : le contrat n'est écrit nulle part
export const getByUserId = async (userId) => {
  return usecases.getProfileRewardsByUserId({ userId });
};
```

**Code.** Conforme : [`users-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/users-api.js#L31-L39). Fautif : [`profile-reward-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/profile/application/api/profile-reward-api.js#L7-L9).

La commande de génération :

```
node scripts/generate-api-documentation.js src/<contexte> > src/<contexte>/API.md
```

Le fichier produit est committé.

**Ce qui casse.** Une fonction exposée sans documentation est une fonction dont le contrat n'existe
pas. Le consommateur doit lire le code du fournisseur : la couche a coûté son prix sans rendre son
service.

**Vérification.** Un script régénère `API.md` et le compare au fichier du dépôt. Il ne voit pas tout.
Voir [`outillage.md`](outillage.md#p3--le-générateur-est-déjà-loracle).

### P4. Le DTO ne porte aucun comportement métier

**Énoncé.** Le DTO est un Value Object : immuable, sans identité, sans règle. `V1`, `V2`, `V6` et `V7`
de `../objet-valeur/README.md` s'appliquent et ne sont pas répétés ici.

Une mise en forme sans décision reste autorisée :

- composer un libellé ;
- aplatir une structure ;
- renommer un champ pour le vocabulaire du contrat.

Un accesseur comme `get isShared() { return Boolean(this.sharedAt); }` est une mise en forme sans
décision. Une règle qui décide de quelque chose est interdite.

```js
// fautif — le DTO se modifie après sa construction, ce que V1 interdit
export class Campaign {
  constructor({ id, code, name, …, targetProfileId }) { … }

  setOrganizationId(id) {
    this.organizationId = id;
  }
}

// conforme — version corrigée de l'extrait ci-dessus : organizationId arrive à la construction
export class Campaign {
  constructor({ id, code, name, …, targetProfileId, organizationId }) {
    …
    this.organizationId = organizationId;
  }
}
```

**Code.** Fautif : [`Campaign.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/application/api/models/Campaign.js#L1-L31), simplifié. La forme corrigée est hypothétique.

Cet extrait illustre `V1`, que `P4` inclut.

Le DTO est l'endroit où renommer. Un champ dont le nom interne est technique ou historique y prend le
nom du contrat, à condition que le nouveau nom reste stable ensuite (`P6`).

**Ce qui casse.** Une règle placée dans le DTO vit en deux exemplaires, dans le modèle et dans le
DTO, et les deux exemplaires divergeront.

**Vérification.** Celle des invariants de Value Object. Voir `../objet-valeur/outillage.md`.

### P5. Un seul emplacement pour l'objet de contrat

**Énoncé.** Le DTO est dans `application/api/models/`. La documentation liée à l'ADR 55 pose deux
règles :

- les APIs internes vivent dans un dossier `api` de la couche application ;
- **les classes qui définissent le contrat sont dans un sous-dossier `models`**.

```
application/api/models/UserDTO.js                                     → conforme
application/api/read-models/OrganizationLearnerWithOrganization.js   → fautif : un autre sous-dossier
application/api/TargetProfile.js                                      → fautif : à la racine de api/
```

**Code.** Conforme : [`UserDTO.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/models/UserDTO.js). Fautifs : [`OrganizationLearnerWithOrganization.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/organization-learner/application/api/read-models/OrganizationLearnerWithOrganization.js) et [`TargetProfile.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/target-profile/application/api/TargetProfile.js).

**Distinguer du read-model.** `domain/read-models/` contient une forme assemblée pour une lecture
interne. L'objet de contrat est un format publié vers un autre contexte. Le même mot recouvre parfois
les deux, ce qui les brouille. Voir `X1` de `../read-model/ecarts.md`, qui traite ce mélange.

**Ce qui casse.** Le lecteur cherche le contrat avant de le trouver. Dès qu'un second emplacement
existe, la vérification de l'emplacement devient impossible.

**Vérification.** Un script d'emplacement. Voir [`outillage.md`](outillage.md#vérifications).

### P6. Le contrat est stable

**Énoncé.** Un contrat s'étend, il ne se casse pas. Trois règles concrètes :

- **ajouter** un champ ou une fonction est sans risque ;
- **renommer ou retirer** demande de connaître les consommateurs et de coordonner ;
- **changer le sens** d'un champ existant est le pire cas, parce que rien ne le signale : ni la
  compilation, ni les tests des voisins.

```js
// conforme — le contrat en vigueur ; un champ peut s'y ajouter sans risque
export class UserDTO {
  constructor(user) {
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.id = user.id;
  }
}

// fautif — hypothétique : un champ existant est renommé, chaque consommateur qui le lit casse
export class UserDTO {
  constructor(user) {
    this.givenName = user.firstName;
    this.lastName = user.lastName;
    this.id = user.id;
  }
}
```

**Code.** Conforme : [`UserDTO.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/models/UserDTO.js#L1-L7). La forme fautive est hypothétique.

La liste des consommateurs est connaissable : ce sont les contextes qui déclarent dépendre de
celui-ci. Un changement cassant commence par cette liste. Pour le cas où la liste des consommateurs
n'est pas connaissable, voir `M3` de `../serialiseur/README.md`.

**Ce qui casse.** Un changement chez le fournisseur casse la CI de plusieurs équipes. Le diagnostic
remonte lentement, puisque rien ne pointe vers la cause.

**Vérification.** La revue. Le typage rend visible un changement de contrat. Voir
[`outillage.md`](outillage.md#vérifier-par-le-typage).

### P7. Le comportement ne dépend pas de l'appelant

**Énoncé.** Une même fonction rend la même chose quel que soit le contexte qui l'appelle. Pas de
paramètre « pour qui », pas de branche selon le consommateur. Un besoin divergent entre deux
consommateurs appelle deux fonctions nommées différemment, chacune avec son contrat.

```js
// conforme à P7 — forme limite : une fonction par appelant, dont le contrat ne dépend de rien
export const getByIdForAdmin = async (id) => {
  const targetProfileForAdmin = await usecases.getTargetProfileForAdmin({ targetProfileId: id });

  return new TargetProfile(targetProfileForAdmin);
};

// fautif — hypothétique : getById et getByIdForAdmin fusionnées, le contrat dépend de qui le lit
export const getById = async ({ id, callerContext }) => {
  const targetProfile =
    callerContext === 'admin'
      ? await usecases.getTargetProfileForAdmin({ targetProfileId: id })
      : await usecases.getTargetProfile({ targetProfileId: id });

  return new TargetProfile(targetProfile);
};
```

**Code.** Conforme : [`target-profile-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/target-profile/application/api/target-profile-api.js#L29-L33). La forme fautive est hypothétique.

Le nom de `getByIdForAdmin` porte l'appelant, mais son contrat ne dépend de rien : une fonction, un
DTO, un comportement. Quand deux consommateurs ont vraiment besoin de deux projections, deux
fonctions nommées respectent `P7`. Une fonction qui teste son appelant ne le respecte pas.

**Ce qui casse.** Une fonction qui se comporte selon son appelant recrée le couplage que la couche
existe pour supprimer. Le fournisseur connaît ses consommateurs, donc il ne peut plus évoluer sans
les considérer un par un.

**Vérification.** La revue. Voir [`outillage.md`](outillage.md#vérifications).

### P8. L'API ne transite pas vers un autre contexte

**Énoncé.** Une API interne sert **son** contexte. Elle n'importe ni repository, ni API d'un contexte
tiers pour composer sa réponse.

```js
// conforme — l'API n'importe que son propre contexte
import { usecases } from '../../domain/usecases/index.js';
import { UserDTO } from './models/UserDTO.js';

// fautif — l'API importe le repository d'un autre contexte pour composer sa réponse
import { tagRepository } from '../../../../organizational-entities/infrastructure/repositories/tag.repository.js';
```

**Code.** Conforme : [`users-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/users-api.js#L1-L2). Fautif : [`organization-learners-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/organization-learner/application/api/organization-learners-api.js#L1).

Quand la composition est vraiment nécessaire, c'est au **consommateur** de l'assembler, en appelant
les deux APIs. Cette composition est de l'orchestration, donc elle relève d'un usecase chez le
consommateur.

**Ce qui casse.** Le fournisseur devient un intermédiaire : le consommateur dépend, sans le savoir,
d'un troisième contexte. Le graphe déclaré ne décrit plus le graphe réel, et une règle de dépendance
passe au vert sur un couplage qu'elle devrait interdire.

**Vérification.** Une règle `dependency-cruiser`. Voir
[`outillage.md`](outillage.md#p2-et-p8--deux-règles-de-chemin).

### P9. Le DTO n'expose que ce que ses consommateurs utilisent

**Énoncé.** Un champ figure dans le DTO parce qu'au moins un contexte consommateur le lit. Un champ
qu'aucun consommateur ne lit n'y figure pas, même s'il existe sur le modèle.

```js
// conforme — une projection : trois champs choisis dans le modèle User
export class UserDTO {
  constructor(user) {
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.id = user.id;
  }
}

// fautif — le DTO recopie le read-model du même nom
export class CampaignParticipation {
  constructor({
    participantFirstName, participantLastName, participantExternalId = null,
    userId, campaignParticipationId, createdAt, sharedAt, status,
  } = {}) { … }
}
```

**Code.** Conforme : [`UserDTO.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/models/UserDTO.js#L1-L7). Fautif : [`CampaignParticipation.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/application/api/models/CampaignParticipation.js#L1-L35), simplifié.

Le DTO est alors la liste exacte de ce que l'équipe du fournisseur s'engage à maintenir. Tout le
reste du modèle peut changer sans prévenir personne.

**Ce qui casse.** Un champ exposé sans consommateur est une promesse que personne n'a demandée.
L'équipe du fournisseur ne peut plus distinguer le contrat du reste : avant chaque refactoring
interne, elle doit vérifier chez tous les consommateurs si le champ touché est lu. `P6` devient
coûteux à tenir, et le bénéfice de `P1` disparaît.

**Vérification.** La revue seule : ni la règle de `P1` ni le typage ne voient un DTO qui recopie le
modèle. Voir [`outillage.md`](outillage.md#vérifications).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant de sa ligne. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **P1** | La fonction rend directement le résultat d'un usecase qui renvoie un scalaire ou rien | autorisé : aucun modèle n'est exposé |
| **P1** | L'API lève une erreur définie dans `application/api/errors.js` | autorisé : l'erreur fait partie du contrat |
| **P1** | Une enveloppe de pagination autour de DTO | autorisé |
| **P7** | Une fonction utilisée par un seul consommateur | autorisé : un contrat commence souvent ainsi. Le nom dit le besoin, pas l'écran du consommateur |
| **P2** | L'API accède à un repository de `shared` | **pas une exception** : c'est une violation de `P2`, même si `shared` est commode |
| **P2** | L'API importe le fichier d'un usecase plutôt que l'index des usecases | **pas une exception** : elle reçoit la fonction sans ses dépendances, et doit alors importer et passer elle-même les repositories, contre `P2`. Même pour casser un import cyclique |
| **P3** | L'API renvoie `null` quand rien n'est trouvé | autorisé si documenté ; le contrat doit dire lequel des deux comportements s'applique |
| **P4** | Le DTO renomme un champ par rapport au modèle interne | autorisé : c'est un bon usage de la couche |
| **P4** | Le DTO aplatit une structure imbriquée | autorisé : mise en forme sans décision |
| **P4** | Le DTO compose un libellé à partir de plusieurs champs | autorisé : mise en forme, pas décision |
| — | Un consommateur importe le domaine du fournisseur | **pas une exception** : c'est `U9` de `../usecase/README.md`, la violation que cette couche existe pour empêcher |

---

## Exemple complet

Une fonction d'API, son DTO et son test, tirés du code.

```js
// l'API — P2 : un usecase ; P1 : un DTO construit ; P3 : la documentation
import { usecases } from '../../domain/usecases/index.js';
import { UserDTO } from './models/UserDTO.js';

/**
 * @function
 * @name getActiveByUserIds
 *
 * @param {Object} params
 * @param {Array<Number>} params.userIds
 * @returns {Promise<Array<UserDTO>>}
 */
export const getActiveByUserIds = async ({ userIds }) => {
  const users = await usecases.getActiveByUserIds({ userIds });

  return users.map((user) => new UserDTO(user));
};
```

```js
// le DTO — P5 : dans models/ ; P9 : trois champs choisis
export class UserDTO {
  constructor(user) {
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.id = user.id;
  }
}
```

```js
// le test — unitaire, le usecase substitué : seul le mapping est testé
it('should return users', async function () {
  const firstUser = domainBuilder.buildUser({ id: 1, firstName: 'Théo', lastName: 'Courant' });
  const secondUser = domainBuilder.buildUser({ id: 2, firstName: 'Alex', lastName: 'Térieur' });

  sinon.stub(usecases, 'getActiveByUserIds');
  usecases.getActiveByUserIds.withArgs({ userIds: [1, 2] }).resolves([firstUser, secondUser]);
  const expectedUsers = [new UserDTO(firstUser), new UserDTO(secondUser)];

  const users = await getActiveByUserIds({ userIds: [1, 2] });

  expect(users).to.deep.equal(expectedUsers);
});
```

**Code.** L'API : [`users-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/users-api.js#L31-L43), imports aux lignes 1 et 2. Le DTO : [`UserDTO.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/models/UserDTO.js#L1-L7). Le test : [`users-api.test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/identity-access-management/unit/application/api/users-api.test.js#L10-L24), sans les commentaires `given` / `when` / `then`.

Côté consommateur, l'API est injectée dans un repository du contexte, qui la traduit : voir l'exemple
complet de `../repository/README.md`.

---

## Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Fonction d'API interne | **unitaire**, usecase substitué | uniquement le mapping du modèle vers le DTO |
| DTO | **unitaire pur** | la forme produite, les renommages, les mises en forme |
| Contrat vu du consommateur | **unitaire** côté consommateur, API substituée | le mapping du DTO vers son vocabulaire local. Voir `../repository/README.md` |

L'existence du fichier de test se vérifie en comparant les noms. Moyens et limites dans
[`../repository/outillage.md`](../repository/outillage.md#tests-attendus--par-le-même-script).

Le test d'une API interne ne doit **pas** rejouer la logique du usecase. Il vérifie la traduction, et
rien d'autre. S'il faut des fixtures métier pour faire passer ce test, `P1` ou `P2` est violé.

Un indice de diagnostic, avec sa limite. Une API dont le test unitaire n'a rien à vérifier ne traduit
rien, donc elle expose probablement le modèle du domaine. Limite : une fonction qui renvoie un
scalaire ou rien n'a pas de traduction à tester, comme dans les
[exceptions légitimes](#exceptions-légitimes).

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle ou le script correspondant existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier, aucun moyen déterministe n'est connu.

```
[ ] [partiel] P1  Aucun return ne rend directement un modèle du domaine
[ ] [auto]    P2  Chaque fonction passe par un usecase, jamais par un repository
[ ] [humain]  P6  Aucun renommage ni retrait sans avoir listé les contextes consommateurs
[ ] [humain]  P9  Chaque champ du DTO est lu par au moins un contexte consommateur
[ ] [partiel] P3  Chaque fonction exportée est documentée ; le fichier API.md régénéré est identique à celui du dépôt
[ ] [auto]    P8  Aucun import d'un autre contexte : ni repository, ni API tierce
[ ] [humain]  P7  Aucun paramètre ni branche qui dépend de l'identité de l'appelant
[ ] [humain]  P4  Le DTO ne porte aucune règle métier, seulement de la mise en forme
[ ] [auto]    P5  Le DTO est dans application/api/models/
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui de l'API
[ ] [humain]  Test unitaire avec usecase substitué, portant sur le mapping seul
```

À terme, sept lignes restent : deux `[partiel]` et cinq `[humain]`. La ligne de `P9` est la plus
importante : aucun outil ne voit un DTO qui recopie le modèle.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| La couche elle-même | ADR 55, « Communication "séquentielle" entre les contextes fonctionnels » |
| **P1** un DTO, jamais le modèle | Evans, *DDD* : Published Language et Open Host Service. ADR 55, qui accepte la duplication des modèles |
| **P2** passe par un usecase | ADR 20, « Est-il obligatoire d'implémenter un use-case dans toutes les situations ? ». Martin, *Clean Architecture* |
| **P3** contrat documenté | Evans, *DDD* : Published Language. La documentation liée à l'ADR 55, hors du dépôt |
| **P4** DTO sans comportement | Evans, *DDD* : Value Object. Énoncés dans `../objet-valeur/README.md` |
| **P5** emplacement du DTO | la documentation liée à l'ADR 55, hors du dépôt |
| **P6** stabilité du contrat | Evans, *DDD*. Vernon, *IDDD* |
| **P7** indépendance de l'appelant | aucune source : déduction de l'Open Host Service |
| **P8** pas de transit | aucune source : déduction de la Context Map d'Evans |
| **P9** seulement ce qui est utilisé | Robinson, « Consumer-Driven Contracts ». Décision d'équipe, sans ADR |
