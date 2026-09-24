# API interne — écarts

Suivi : où le code des APIs internes s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** L'API renvoie un modèle du domaine plutôt qu'un DTO | dérive | Le boilerplate de la couche est payé sans la liberté de refactorer. Chaque champ du modèle devient une promesse implicite | Pas de DTO à écrire ni à maintenir | **À corriger** |
| **X2** L'API appelle un repository sans passer par un usecase | dérive | Deux comportements pour la même question, selon qu'elle est posée de l'intérieur ou de l'extérieur | La lecture est immédiate, sans usecase à écrire | **À corriger** |
| **X3** L'objet de contrat n'est pas dans le dossier décidé | dérive | La convention documentée n'est pas appliquée partout, donc son script de vérification ne peut pas être bloquant. Et le mot `read-model` recouvre deux notions | Nul : la décision existe, mais elle n'est pas appliquée | **À corriger** |
| **X4** L'API importe une API ou un repository d'un contexte tiers | dérive | Le graphe déclaré ne décrit plus le graphe réel. Une règle de dépendance passe au vert sur un couplage réel | La composition est faite une fois chez le fournisseur au lieu de chez chaque consommateur | **À corriger** |
| **X5** Le DTO expose exactement les champs de l'Entity | dérive | Le contrat suit le modèle : ajouter un champ interne l'expose, le renommer casse le contrat. L'équipe du fournisseur ne sait pas quels champs ses consommateurs lisent | Pas de choix de champs à faire à l'ouverture de l'API | **À corriger** |

---

### X1. L'API renvoie un modèle du domaine plutôt qu'un DTO

**Exemple concret.**

```js
export const save = async (userId, rewardId) => {
  return usecases.rewardUser({ userId, rewardId });          // le modèle sort tel quel
};

export const getByUserId = async (userId) => {
  return usecases.getProfileRewardsByUserId({ userId });     // idem
};

export const findByUserIdAndRewardId = async ({ rewardId, userId }) => {
  return usecases.findByUserIdAndRewardId({ rewardId, userId });   // idem
};
```

**Code.** [`profile-reward-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/profile/application/api/profile-reward-api.js#L3-L13).

**Verdict.** À corriger. Le coût de la couche est payé, et la liberté de refactorer n'est pas
obtenue. La théorie est dans
[`explication.md`](explication.md#x1-lapi-renvoie-un-modèle-du-domaine-plutôt-quun-dto).

**Correction.** Introduire le DTO. Cela demande de décider quels champs exposer : c'est le cœur du
travail de contrat, pas une transformation.

Ne jamais envelopper le modèle dans un DTO aux mêmes champs sans avoir choisi ces champs. Le lint
passe au vert, la forme interne reste le contrat, et la dette devient invisible. Voir
[`outillage.md`](outillage.md#p1--détecter-le-modèle-du-domaine-qui-fuit) pour ce que la règle ne
voit pas, et `P9` de [`README.md`](README.md#p9-le-dto-nexpose-que-ce-que-ses-consommateurs-utilisent)
pour le choix des champs.

### X2. L'API appelle un repository sans passer par un usecase

**Exemple concret.**

```js
export function get(challengeId) {
  return challengeToPlayRepository.get(challengeId);
}
```

**Code.** [`challenge-to-play-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/application/api/challenge-to-play-api.js#L11-L13).

Une règle de lecture, comme un filtrage ou un contrôle de droits, vit dans le usecase que cet appel
contourne, si elle existe.

**Verdict.** À corriger : le seul bénéfice est un usecase de moins à écrire. La théorie est dans
[`explication.md`](explication.md#x2-lapi-appelle-un-repository-sans-passer-par-un-usecase).

**Correction.** Écrire le usecase manquant, souvent une délégation d'une ligne. L'ADR 20 l'admet :
voir `X5` de `../usecase/ecarts.md`. La correction est mécanique dans la plupart des cas.

Une partie ne l'est pas : constater qu'une règle existait dans un usecase voisin, et décider si elle
s'applique. C'est le vrai contenu de la correction.

### X3. L'objet de contrat n'est pas dans le dossier décidé

**Exemple concret.** Le dossier décidé, et les emplacements employés à la place :

```
application/api/models/         → décidé par la documentation de l'ADR 55
application/api/read-models/    → employé dans certains contextes
application/api/                → DTO posé à la racine, dans certains contextes
```

**Code.** Décidé : [`identity-access-management/application/api/models`](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/models). Sous `read-models/` : [`prescription/organization-learner/application/api/read-models`](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/organization-learner/application/api/read-models). À la racine : [`prescription/target-profile/application/api`](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/target-profile/application/api).

L'écart pose deux problèmes. D'abord, la convention n'est pas suivie, donc son script ne peut pas être
bloquant. Ensuite, sous `application/api/read-models/`, le mot `read-model` désigne un DTO de contrat,
alors que sous `domain/read-models/` il désigne une forme de lecture interne. C'est le mélange que
décrit `X1` de `../read-model/ecarts.md`.

L'écart précis par contexte est mesuré dans les rapports de divergence, pas ici.

**Verdict.** À corriger. La règle est `P5` de
[`README.md`](README.md#p5-un-seul-emplacement-pour-lobjet-de-contrat). Aucun arbitrage n'est
nécessaire, donc l'écart est peu coûteux à corriger. La théorie est dans
[`explication.md`](explication.md#x3-lobjet-de-contrat-nest-pas-dans-le-dossier-décidé).

**Correction.** Déplacer vers `models/` et réécrire les imports. La correction est mécanique : aucune
décision n'est à prendre, donc un codemod fait le travail. Un déplacement à la main casse des imports.

La correction rend le script de `P5` activable en erreur : voir
[`outillage.md`](outillage.md#ordre-de-mise-en-œuvre).

### X4. L'API importe une API ou un repository d'un contexte tiers

**Exemple concret.** L'API injecte le repository d'un autre contexte dans un usecase pour composer sa
réponse :

```js
import { tagRepository } from '../../../../organizational-entities/infrastructure/repositories/tag.repository.js';

export const findWithOrganizationByIds = async ({ organizationLearnerIds, organizationId }) => {
  const learners = await findOrganizationLearnersWithOrganizationByIds({
    organizationLearnerIds,
    organizationId,
    libOrganizationLearnerRepository,
    organizationRepository,
    tagRepository, // repository d'un autre contexte : l'API devient un intermédiaire
  });
  return learners.map((learner) => new OrganizationLearnerWithOrganization(learner));
};
```

**Code.** [`organization-learners-api.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/organization-learner/application/api/organization-learners-api.js#L154-L163), import à la ligne 1.

Le consommateur de cette API dépend du contexte qui fournit `tagRepository`, et rien dans ses
déclarations de dépendances ne le dit. Le même fichier viole aussi `P2` : il importe des repositories,
dont celui de `shared`. La règle de `P2` signale donc cet import avant celle de `P8`.

**Verdict.** À corriger. Le bénéfice, une composition faite une fois, ne compense pas un graphe de
dépendances faux. La théorie est dans
[`explication.md`](explication.md#x4-lapi-importe-une-api-ou-un-repository-dun-contexte-tiers).

**Correction.** Déplacer la composition chez le **consommateur**, qui appelle les deux APIs. Chez lui,
c'est de l'orchestration, donc un usecase. Ses dépendances déclarées redeviennent vraies.

La correction est coûteuse : elle déplace du travail du fournisseur vers chaque consommateur, et il
peut y en avoir plusieurs. C'est le prix d'un graphe exact. Une fois les écarts corrigés, la règle de
`P8` garde le graphe exact par configuration seule : voir
[`outillage.md`](outillage.md#p2-et-p8--deux-règles-de-chemin).

### X5. Le DTO expose exactement les champs de l'Entity

**Exemple concret.** La classe de base du DTO de contrat recopie le read-model du domaine du même
nom : mêmes champs, mêmes accesseurs.

```js
// le read-model du domaine
class CampaignParticipation {
  constructor({
    participantFirstName, participantLastName, participantExternalId = null,
    userId, campaignParticipationId, createdAt, sharedAt, status,
  } = {}) { … }

  get id() { return this.campaignParticipationId; }
  get isShared() { return Boolean(this.sharedAt); }
}

// le DTO de contrat — même constructeur, mêmes accesseurs
export class CampaignParticipation {
  constructor({
    participantFirstName, participantLastName, participantExternalId = null,
    userId, campaignParticipationId, createdAt, sharedAt, status,
  } = {}) { … }

  get id() { return this.campaignParticipationId; }
  get isShared() { return Boolean(this.sharedAt); }
}
```

**Code.** Le read-model : [`domain/read-models/CampaignParticipation.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/domain/read-models/CampaignParticipation.js#L1-L44), simplifié. Le DTO : [`application/api/models/CampaignParticipation.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/application/api/models/CampaignParticipation.js#L1-L44), simplifié.

Le modèle recopié est ici un read-model du domaine plutôt qu'une Entity. L'écart est le même. Dans le
même fichier, la classe [`TubeCoverage`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/campaign/application/api/models/CampaignParticipation.js#L86-L111)
renomme et retire des champs. La classe de base, elle, ne montre aucun choix : rien n'y distingue les
champs choisis pour l'échange des champs repris parce qu'ils étaient là.

À l'inverse, `UserDTO` est une projection : trois champs choisis dans le modèle `User`.

```js
// conforme — une projection délibérée, pas une recopie
export class UserDTO {
  constructor(user) {
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.id = user.id;
  }
}
```

**Code.** [`UserDTO.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/identity-access-management/application/api/models/UserDTO.js#L1-L7).

Un DTO écrit au moment d'ouvrir une API prend facilement la forme du modèle, et personne ne revient
dessus.

**Verdict.** À corriger. L'équipe a décidé qu'un DTO n'expose que les champs que ses consommateurs
lisent : c'est `P9` de
[`README.md`](README.md#p9-le-dto-nexpose-que-ce-que-ses-consommateurs-utilisent). La théorie est
dans [`explication.md`](explication.md#x5-le-dto-expose-exactement-les-champs-de-lentity).

**Correction.** Pour chaque DTO, relever les champs que lisent les contextes consommateurs, qui sont
ceux qui déclarent dépendre du fournisseur. Retirer les autres, en coordination avec ces contextes
comme le demande `P6`. Le relevé demande de lire le code des consommateurs ; le retrait est ensuite
mécanique.
