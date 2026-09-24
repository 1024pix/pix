# Fiche — API interne

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - Le § 3 est la section la moins stabilisée de la fiche. La couche est jeune, et plusieurs lignes
>   sont des propositions plutôt que des conventions arrêtées. Deux lignes sont non tranchées : la
>   fonction utilisée par un seul consommateur, et l'import individuel d'un usecase.
> - La source de `P5` et de `P3` est une page Confluence liée par l'ADR 55, donc **hors du dépôt**.
>   La règle est tenue pour vraie. Reste à la reporter dans l'ADR 55, en deux phrases : le dossier
>   `api` et le sous-dossier `models`.
> - `P7` et `P8` sont des déductions, pas des citations. Ils proposent des conventions là où l'équipe
>   n'en a pas arrêté.

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
| [**P1**](#p1-lapi-expose-un-dto-jamais-un-modèle-du-domaine) | l'API expose un DTO, jamais un modèle du domaine | **forte** | règle ESLint, partielle |
| [**P2**](#p2-lapi-passe-par-un-usecase) | l'API passe par un usecase | **forte** | `dependency-cruiser` |
| [**P6**](#p6-le-contrat-est-stable) | le contrat est stable | **forte** | revue |
| [**P3**](#p3-le-contrat-est-documenté) | le contrat est documenté | moyenne | script, partiel, sans faux positif |
| [**P8**](#p8-lapi-ne-transite-pas-vers-un-autre-contexte) | l'API ne transite pas vers un autre contexte | moyenne | `dependency-cruiser` |
| [**P7**](#p7-le-comportement-ne-dépend-pas-de-lappelant) | le comportement ne dépend pas de l'appelant | moyenne | revue |
| [**P4**](#p4-le-dto-ne-porte-aucun-comportement-métier) | le DTO ne porte aucun comportement métier | hygiène | voir `fiche-objet-valeur.md` |
| [**P5**](#p5-un-seul-emplacement-pour-lobjet-de-contrat) | un seul emplacement pour l'objet de contrat | hygiène | script, bloquant après `X3` |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-lapi-renvoie-un-modèle-du-domaine-plutôt-quun-dto) | l'API renvoie un modèle du domaine plutôt qu'un DTO | **à corriger** |
| [**X2**](#x2-lapi-appelle-un-repository-sans-passer-par-un-usecase) | l'API appelle un repository sans passer par un usecase | **à corriger** |
| [**X3**](#x3-lobjet-de-contrat-nest-pas-dans-le-dossier-décidé) | l'objet de contrat n'est pas dans le dossier décidé | **à corriger** |
| [**X4**](#x4-lapi-importe-une-api-ou-un-repository-dun-contexte-tiers) | l'API importe une API ou un repository d'un contexte tiers | **à corriger** |
| [**X5**](#x5-le-dto-expose-exactement-les-champs-de-lentity) | le DTO expose exactement les champs de l'Entity | à surveiller |

Hors numérotation : le [sens de lecture](#le-sens-de-lecture-souvent-inversé) du § 1, qui relie
cette fiche à `I1` de `fiche-repository.md`. La distinction entre objet de contrat et read-model est
dans `X1` de `fiche-read-model.md`, pas ici.

---

## 1. Rôle

Une API interne est le **contrat publié** d'un Bounded Context : ce qu'il accepte de faire pour les
autres, et sous quelle forme il leur répond.

Un contexte voisin doit passer par ce seul point. Le reste du contexte lui est inaccessible :
modèles, usecases, repositories.

Deux propriétés en découlent. Elles sont la raison d'être de la couche :

- le contexte fournisseur reste libre de changer son modèle, sa base et ses usecases, tant que le
  contrat tient ;
- le contexte consommateur reste autonome, sans avoir à connaître le fonctionnement interne du
  voisin.

La couche rend aussi explicite dans le code l'attribution des sujets aux équipes. C'est l'objectif
affiché de l'ADR 55, qui a instauré la couche.

### Le sens de lecture, souvent inversé

L'API interne est écrite par le contexte **fournisseur**. Le contexte **consommateur** ne l'appelle pas
directement depuis son domaine. Il la reçoit injectée dans un de ses repositories, qui traduit vers
son propre vocabulaire.

Cette fiche et `fiche-repository.md` se lisent donc ensemble. `P1` décrit ce qui sort de l'API.
`I1` de `fiche-repository.md` décrit ce que le voisin doit en faire : le traduire, et non le laisser
entrer intact dans son domaine.

### Ce qu'une API interne n'est pas

Si le code correspond à une ligne, ce n'est pas une API interne.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| est appelé par une requête HTTP | un contrôleur, dans `application/` | `fiche-controleur.md` |
| réalise l'intention métier | un usecase | `fiche-usecase.md` |
| accède aux données | un repository | `fiche-repository.md` |
| consomme l'API d'un voisin | un repository du contexte consommateur | `fiche-repository.md` |
| met en forme pour une réponse HTTP | un sérialiseur | `fiche-serialiseur.md` |
| réagit à un événement d'un autre contexte | le mécanisme événementiel | hors périmètre du corpus |

---

## 2. Invariants

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

La forme fautive se reconnaît à sa longueur : une seule ligne, sans `new`. Seule exception : un
usecase qui renvoie un scalaire ou rien (§ 6). Un fichier d'API dont toutes les fonctions ont cette
forme n'a pas de contrat. Il n'est qu'une liste de raccourcis vers les usecases du contexte.

**Ce qui casse.** Chaque champ du modèle devient une promesse implicite. Un renommage interne casse
les voisins à l'exécution, sans qu'aucune règle de dépendance ne bouge. `dependency-cruiser` reste
vert, parce que la dépendance de module n'a pas changé.

L'ADR 55 accepte et documente la duplication que `P1` introduit. Ce n'est pas une dette : c'est le
prix de la liberté de refactorer.

Envelopper le modèle dans un DTO aux mêmes champs, sans choisir ces champs, respecte `P1` à la lettre
et le viole dans son esprit. Le lint passe au vert, et la forme interne reste le contrat. Voir `X5`.

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

Le même fichier fautif expose aussi la configuration de sérialisation du contexte :

```js
import { challengeToPlaySerializer } from '../../infrastructure/serializers/jsonapi/challenge-to-play-serializer.js';

export function getSerializationConfig() {
  return challengeToPlaySerializer.config;
}
```

Ici, le contrat publié n'expose pas seulement un modèle du domaine. Il expose aussi la configuration
de sérialisation du contexte. Le voisin reçoit de quoi produire lui-même la réponse HTTP, donc le
format de sortie d'un contexte devient une dépendance de l'autre. `P1` n'interdit pas ce cas
explicitement. La règle de `P2` au § 6 le signale, parce que le sérialiseur est importé depuis
`infrastructure/`.

**Ce qui casse.** Une lecture porte aussi des règles : filtrage des éléments supprimés, droits,
périmètre. Les court-circuiter pour les seuls voisins crée deux comportements pour la même question,
selon qu'elle est posée de l'intérieur ou de l'extérieur du contexte.

Le motif d'erreur le plus courant : la donnée demandée est « juste une lecture », et le usecase
paraît superflu. C'est ainsi que la porte dérobée s'ouvre.

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

La commande de génération :

```
node scripts/generate-api-documentation.js src/<contexte> > src/<contexte>/API.md
```

Le fichier produit est committé. L'invariant est donc en partie vérifiable : il suffit de régénérer
le fichier et de le comparer à celui du dépôt. Voir le § 6 pour ce que cette comparaison ne voit pas.

**Ce qui casse.** Une fonction exposée sans documentation est une fonction dont le contrat n'existe
pas. Le consommateur doit lire le code du fournisseur : la couche a coûté son prix sans rendre son
service.

### P4. Le DTO ne porte aucun comportement métier

**Énoncé.** Le DTO est un Value Object : immuable, sans identité, sans règle. `V1`, `V2`, `V6` et `V7`
de `fiche-objet-valeur.md` s'appliquent et ne sont pas répétés ici.

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

Cet extrait illustre `V1`, que `P4` inclut.

**Ce qui casse.** Une règle placée dans le DTO vit en deux exemplaires, dans le modèle et dans le
DTO, et les deux exemplaires divergeront.

Le DTO est l'endroit où renommer. Un champ dont le nom interne est technique ou historique y prend le
nom du contrat. C'est l'un des usages les plus utiles de la couche, à condition que le nouveau nom
reste stable ensuite (`P6`).

### P5. Un seul emplacement pour l'objet de contrat

**Énoncé.** Le DTO est dans `application/api/models/`. La convention est décidée. La documentation
liée à l'ADR 55 pose deux règles :

- les APIs internes vivent dans un dossier `api` de la couche application ;
- **les classes qui définissent le contrat sont dans un sous-dossier `models`**.

Il n'y a donc rien à décider. L'écart d'application est `X3` au § 5.

```
application/api/models/UserDTO.js                                     → conforme
application/api/read-models/OrganizationLearnerWithOrganization.js   → fautif : un autre sous-dossier
application/api/TargetProfile.js                                      → fautif : à la racine de api/
```

**Ce qui casse.** Le lecteur cherche le contrat avant de le trouver. Dès qu'un second emplacement
existe, la vérification de l'emplacement devient impossible.

**Distinguer du read-model.** `domain/read-models/` contient une forme assemblée pour une lecture
interne. L'objet de contrat est un format publié vers un autre contexte. Le même mot recouvre parfois
les deux, ce qui les brouille. Voir `X1` de `fiche-read-model.md`, qui traite ce mélange.

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

**Ce qui casse.** Un changement chez le fournisseur casse la CI de plusieurs équipes. Le diagnostic
remonte lentement, puisque rien ne pointe vers la cause.

Cet invariant est tenable ici, contrairement au format HTTP, parce que la liste des consommateurs est
connaissable : ce sont les contextes qui déclarent dépendre de celui-ci. Un changement cassant
commence par cette liste. Pour le cas où la liste des consommateurs n'est pas connaissable, voir
`M3` de `fiche-serialiseur.md`.

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

Le nom de `getByIdForAdmin` porte l'appelant, mais son contrat ne dépend de rien : une fonction, un
DTO, un comportement. Quand deux consommateurs ont vraiment besoin de deux projections, deux
fonctions nommées respectent `P7`. Une fonction qui teste son appelant ne le respecte pas.

Cette forme limite a un défaut : son nom désigne un écran plutôt qu'un besoin métier. Si l'écran
change, le contrat se périme. `getWithFullReferential` vieillirait mieux que `getByIdForAdmin`.

**Ce qui casse.** Une fonction qui se comporte selon son appelant recrée le couplage que la couche
existe pour supprimer. Le fournisseur connaît ses consommateurs, donc il ne peut plus évoluer sans
les considérer un par un.

### P8. L'API ne transite pas vers un autre contexte

**Énoncé.** Une API interne sert **son** contexte. Elle n'importe ni repository, ni API d'un contexte
tiers pour composer sa réponse.

```js
// conforme — l'API n'importe que son propre contexte
import { usecases } from '../../domain/usecases/index.js';
import { UserDTO } from './models/UserDTO.js';

// fautif — l'API importe le repository d'un autre contexte pour composer sa réponse
import { tagRepository } from '../../../../<autre-contexte>/infrastructure/repositories/tag.repository.js';
```

**Ce qui casse.** Le fournisseur devient un intermédiaire : le consommateur dépend, sans le savoir,
d'un troisième contexte. Le graphe déclaré ne décrit plus le graphe réel, et une règle de dépendance
passe au vert sur un couplage qu'elle devrait interdire.

Quand la composition est vraiment nécessaire, c'est au **consommateur** de l'assembler, en appelant
les deux APIs. Cette composition est de l'orchestration, donc elle relève d'un usecase chez le
consommateur.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Le DTO renomme un champ par rapport au modèle interne | **autorisé** : c'est un bon usage de la couche. `P4` |
| Le DTO aplatit une structure imbriquée | **autorisé** : mise en forme sans décision |
| Le DTO compose un libellé à partir de plusieurs champs | **autorisé** : mise en forme, pas décision |
| L'API renvoie `null` quand rien n'est trouvé | **autorisé** si documenté ; le contrat doit dire lequel des deux comportements s'applique. `P3` |
| L'API lève une erreur définie dans `application/api/errors.js` | **autorisé** : l'erreur fait partie du contrat |
| Une enveloppe de pagination autour de DTO | **autorisé** |
| L'API expose une fonction utilisée par un seul consommateur | **non tranché** : c'est le début d'un tunnel plutôt que d'un contrat. Voir le § 4 |
| L'API importe un usecase individuellement plutôt que l'index | **non tranché** : sans effet visible, mais contourne le point unique de câblage |
| L'API accède à un repository de `shared` | **pas une exception** : c'est une violation de `P2`, même si `shared` est commode |
| Un consommateur importe le domaine du fournisseur | **pas une exception** : c'est `U9` de `fiche-usecase.md`, la violation que cette couche existe pour empêcher |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **P1** un DTO, jamais le modèle | **forte** | Le fournisseur refactore son domaine sans casser personne. C'est la contrepartie du coût de la couche |
| **P2** passe par un usecase | **forte** | Les règles métier valent aussi pour les voisins. Sans `P2`, l'API est une porte dérobée vers la base |
| **P6** contrat stable | **forte** | Un changement chez le fournisseur ne casse pas la CI de plusieurs équipes |
| **P3** contrat documenté | moyenne | Un consommateur sait ce qu'il peut appeler sans lire le code du fournisseur. La charge mentale entre équipes baisse |
| **P8** pas de transit | moyenne | Le graphe de dépendances entre contextes reste lisible et acyclique |
| **P7** indépendant de l'appelant | moyenne | Le couplage que la couche existe pour supprimer ne se recrée pas |
| **P4** DTO sans comportement | hygiène | Un seul modèle à faire évoluer plutôt que deux. Aucun défaut prévenu directement |
| **P5** emplacement unique | hygiène | Le contrat se trouve sans chercher, et le script de `P5` peut devenir bloquant |

### Le ROI de cette couche est décalé dans le temps

Le coût de la couche est payé d'avance, et son bénéfice arrive plus tard. Le DTO, l'injection et le
test s'écrivent tout de suite. La liberté de refactorer ne se constate que le jour où le fournisseur
change son modèle. Ce décalage explique la plupart des écarts de la couche.

Ce décalage pousse à contourner `P1`. Or contourner `P1` annule le bénéfice alors que le coût est
déjà payé : une couche d'API interne dont les DTO sont les modèles paie le coût sans le bénéfice.

### Ce que ça n'apporte pas

Ces invariants ne disent pas ce qu'il faut exposer. Une API qui les respecte tous mais expose des
dizaines de méthodes calquées sur les besoins d'un seul consommateur n'est pas un contrat : c'est un
tunnel. Le dimensionnement reste un travail de conception entre les deux équipes.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** L'API renvoie un modèle du domaine plutôt qu'un DTO | dérive | Le boilerplate de la couche est payé sans la liberté de refactorer. Chaque champ du modèle devient une promesse implicite | Pas de DTO à écrire ni à maintenir | **À corriger** |
| **X2** L'API appelle un repository sans passer par un usecase | dérive | Deux comportements pour la même question, selon qu'elle est posée de l'intérieur ou de l'extérieur | La lecture est immédiate, sans usecase à écrire | **À corriger** |
| **X3** L'objet de contrat n'est pas dans le dossier décidé | dérive | La convention documentée n'est pas appliquée partout, donc son script de vérification ne peut pas être bloquant. Et le mot `read-model` recouvre deux notions | Nul : la décision existe, mais elle n'est pas appliquée | **À corriger** |
| **X4** L'API importe une API ou un repository d'un contexte tiers | dérive | Le graphe déclaré ne décrit plus le graphe réel. Une règle de dépendance passe au vert sur un couplage réel | La composition est faite une fois chez le fournisseur au lieu de chez chaque consommateur | **À corriger** |
| **X5** Le DTO expose exactement les champs de l'Entity | convention assumée si la coïncidence est délibérée, dérive sinon | Le contrat suit le modèle : ajouter un champ interne l'expose, le renommer casse le contrat | Réel si la coïncidence est délibérée : le contrat est alors le modèle, et il n'y a rien à décider | *À surveiller* |

### X1. L'API renvoie un modèle du domaine plutôt qu'un DTO

**Ce que dit la théorie.** Evans traite le sujet sous *Published Language* et *Open Host Service* :
ce qui se publie est un langage dédié à l'échange, pas le modèle interne.

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

**Correction.** Introduire le DTO. Cela demande de décider quels champs exposer : c'est le cœur du
travail de contrat, pas une transformation.

Ne jamais envelopper le modèle dans un DTO aux mêmes champs sans avoir choisi ces champs. Le lint
passe au vert, la forme interne reste le contrat, et la dette devient invisible. Voir le § 6 pour ce
que la règle ne voit pas, et `X5` pour la coïncidence délibérée.

### X2. L'API appelle un repository sans passer par un usecase

**Ce que dit la théorie.** L'API interne est un adaptateur d'entrée. Martin place les règles
applicatives dans la couche *Use Cases*, que tout appelant traverse.

**Exemple concret.**

```js
export function get(challengeId) {
  return challengeToPlayRepository.get(challengeId);
}
```

Une règle de lecture, comme un filtrage ou un contrôle de droits, vit dans le usecase que cet appel
contourne, si elle existe.

**Correction.** Écrire le usecase manquant, souvent une délégation d'une ligne. L'ADR 20 l'admet :
voir `X5` de `fiche-usecase.md`. La correction est mécanique dans la plupart des cas.

Une partie ne l'est pas : constater qu'une règle existait dans un usecase voisin, et décider si elle
s'applique. C'est le vrai contenu de la correction.

### X3. L'objet de contrat n'est pas dans le dossier décidé

**Ce que dit la théorie.** La théorie ne prescrit pas d'arborescence. Ici, la convention **existe** :
la documentation liée à l'ADR 55 la pose. L'écart porte donc sur une décision déjà prise, pas sur la
théorie.

Aucun arbitrage n'est nécessaire, donc l'écart est peu coûteux à corriger.

**Exemple concret.** Le dossier décidé, et les emplacements employés à la place :

```
application/api/models/         → décidé par la documentation de l'ADR 55
application/api/read-models/    → employé dans certains contextes
application/api/                → DTO posé à la racine, dans certains contextes
```

L'écart pose deux problèmes. D'abord, la convention n'est pas suivie, donc son script ne peut pas être
bloquant. Ensuite, sous `application/api/read-models/`, le mot `read-model` désigne un DTO de contrat,
alors que sous `domain/read-models/` il désigne une forme de lecture interne. C'est le mélange que
décrit `X1` de `fiche-read-model.md`.

**Correction.** Déplacer vers `models/` et réécrire les imports. La correction est mécanique : aucune
décision n'est à prendre, donc un codemod fait le travail. Un déplacement à la main casse des imports.

La correction rend le script de `P5` activable en erreur.

L'écart précis par contexte est mesuré dans les rapports de divergence, pas ici.

### X4. L'API importe une API ou un repository d'un contexte tiers

**Ce que dit la théorie.** La Context Map d'Evans doit décrire les dépendances réelles. Un
intermédiaire non déclaré la rend fausse.

**Exemple concret.** L'API injecte le repository d'un autre contexte dans un usecase pour composer sa
réponse :

```js
import { tagRepository } from '../../../../<autre-contexte>/infrastructure/repositories/tag.repository.js';

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

Le consommateur de cette API dépend du contexte qui fournit `tagRepository`, et rien dans ses
déclarations de dépendances ne le dit. Le même fichier viole aussi `P2` : il importe des repositories,
dont celui de `shared`. La règle de `P2` au § 6 signale donc cet import avant celle de `P8`.

**Correction.** Déplacer la composition chez le **consommateur**, qui appelle les deux APIs. Chez lui,
c'est de l'orchestration, donc un usecase. Ses dépendances déclarées redeviennent vraies.

La correction est coûteuse : elle déplace du travail du fournisseur vers chaque consommateur, et il
peut y en avoir plusieurs. C'est le prix d'un graphe exact. Une fois les écarts corrigés, la règle de
`P8` au § 6 garde le graphe exact par configuration seule.

### X5. Le DTO expose exactement les champs de l'Entity

**Ce que dit la théorie.** Le Published Language est choisi pour l'échange. Il peut coïncider avec le
modèle interne, mais la coïncidence doit être un choix constaté, pas un défaut d'arbitrage.

**Exemple concret.** La classe de base du DTO de contrat recopie le read-model du domaine du même
nom : mêmes champs, mêmes accesseurs.

```js
// domain/read-models/CampaignParticipation.js
class CampaignParticipation {
  constructor({
    participantFirstName, participantLastName, participantExternalId = null,
    userId, campaignParticipationId, createdAt, sharedAt, status,
  } = {}) { … }

  get id() { return this.campaignParticipationId; }
  get isShared() { return Boolean(this.sharedAt); }
}

// application/api/models/CampaignParticipation.js — même constructeur, mêmes accesseurs
export class CampaignParticipation {
  constructor({
    participantFirstName, participantLastName, participantExternalId = null,
    userId, campaignParticipationId, createdAt, sharedAt, status,
  } = {}) { … }

  get id() { return this.campaignParticipationId; }
  get isShared() { return Boolean(this.sharedAt); }
}
```

Le modèle recopié est ici un read-model du domaine plutôt qu'une Entity. L'écart est le même. Dans le
même fichier, la classe `TubeCoverage` renomme et retire des champs. La classe de base, elle, ne
montre aucun choix : rien n'y distingue les champs choisis pour l'échange des champs repris parce
qu'ils étaient là.

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

Le risque existe : un DTO écrit à la hâte au moment d'ouvrir une API prend la forme du modèle, et
personne ne revient dessus.

**Correction.** Aucune tant que la coïncidence est **délibérée** : un contrat qui reprend le modèle
peut être le bon contrat. C'est ce qui classe l'écart *à surveiller* plutôt qu'à corriger.

Vérifier, fonction par fonction, si chaque champ exposé l'est parce qu'un consommateur en a besoin, ou
parce qu'il était là. La seconde réponse rend `P6` intenable : personne ne peut s'engager sur la
stabilité de champs que personne n'a choisis.

**Révision.** Le premier champ interne à masquer, ou le premier renommage refusé parce qu'il
casserait le contrat, rend l'arbitrage dû.

---

## 6. Vérification déterministe

La convention de `P5` est décidée, mais pas appliquée partout : c'est `X3`. Tant que `X3` reste
ouvert, les deux règles de chemin sont ce qui rapporte, et elles ne coûtent que de la configuration.

Il n'existe pas de plugin ESLint maison. Toute règle sur mesure suppose d'abord de créer cette
infrastructure.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **P2** passe par un usecase | règle `dependency-cruiser` : `application/api/**` ne dépend pas de `infrastructure/**` | configuration seule | aucun |
| **P8** pas de transit | règle `dependency-cruiser` : `application/api/**` ne dépend pas d'un autre contexte | configuration seule | aucun |
| **P3** contrat documenté | régénérer `API.md` et comparer au fichier committé | ~10 lignes | aucun |
| **P1** un DTO | règle ESLint : un `return` d'API qui rend directement le résultat d'un usecase | ~40 lignes | un connu, les autres **à mesurer** |
| **P5** emplacement | script : l'objet de contrat est dans `application/api/models/` | ~20 lignes | aucun. **Bloquant après `X3`** |
| **P4** DTO sans comportement | voir § 6 de `fiche-objet-valeur.md` | — | — |
| **P6**, **P7** | revue | — | — |

### P2 et P8 — deux règles de chemin, les plus rentables

```js
{
  name: 'internal-api-must-not-access-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/application/api/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

La seconde règle interdit à une API de dépendre d'un **autre** contexte. Elle s'écrit avec un groupe
capturé sur le nom du contexte. La difficulté est la même que pour `U9` de `fiche-usecase.md` :
exprimer « un autre contexte que le sien ».

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Le chemin s'écrit `src/.+/` et non `src/[^/]+/`. Sinon, la règle n'atteint pas les contextes
à sous-contextes et ne se déclenche jamais, sans le signaler. La contre-épreuve est obligatoire.

### P1 — détecter le modèle du domaine qui fuit

Un sous-cas se détecte sans analyse de flot :

> Dans un fichier de `application/api/`, un `return` ou un `return await` dont l'expression est
> directement un appel sur `usecases`.

C'est le cas le plus simple : le modèle du domaine sort tel quel. Les élargissements, comme une
variable intermédiaire ou une expression conditionnelle, suivent la même progression que `I1` de
`fiche-repository.md`, avec le même risque croissant de faux positifs.

Ce sous-cas a déjà un faux positif : si le usecase renvoie un scalaire ou rien, la fonction n'expose
aucun modèle. C'est la limite de l'indice du § 8.

**Limite.** La règle ne voit pas une API qui construit un objet recopiant exactement le modèle. Ce cas
respecte `P1` à la lettre et le viole dans son esprit. C'est `X5`, et seule la revue le détecte.

### P3 — le générateur est déjà l'oracle

Le script de génération existe. La vérification n'est donc pas à écrire, elle est à **brancher** :
régénérer la documentation et la comparer au fichier committé.

```
diff <(node scripts/generate-api-documentation.js src/<contexte> | grep -v '^This doc has been generated') \
     <(grep -v '^This doc has been generated' src/<contexte>/API.md)
```

**Piège.** Le générateur écrit la date de génération en première ligne. La comparaison exclut cette
ligne, sinon elle échoue à chaque exécution.

La vérification tient en dix lignes de test, sans faux positif. Elle est plus forte qu'un script qui
vérifierait la présence d'un commentaire, parce qu'une documentation modifiée sans régénération fait
échouer le test. La documentation committée ne peut donc plus s'écarter de la documentation écrite
dans le code.

**Limite.** La comparaison ne voit pas une fonction exportée sans documentation, que le générateur
omet. Elle ne voit pas non plus une signature changée sans que sa documentation change. Enfin, elle
ne dit pas que la documentation est juste : un contrat mal décrit se régénère fidèlement. `P6`
reste donc en revue.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **P2**, puis **P8** : configuration `dependency-cruiser`, avec contre-épreuve. Introduire une
   violation, vérifier que l'outil la signale, puis la retirer.
2. **P3** : brancher le générateur en test, sur les contextes qui ont déjà un `API.md` committé.
3. **`X3`** : déplacer les objets de contrat vers `models/`, par codemod.
4. **P5** : le script d'emplacement, activable en erreur après `X3`.
5. **P1** : la règle ESLint, en avertissement d'abord.

Les points 1 et 2 ne dépendent de rien.

### Codemods

Un codemod peut appliquer une décision. Il ne peut pas en prendre une.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** emplacement | oui, complet | Déplacer vers `models/` et réécrire les imports. La convention étant décidée, il n'y a aucune décision à prendre |
| **X2** usecase manquant | partiel | Remplacer l'appel de repository par un usecase existant, oui. Écrire celui qui manque, non |
| **X1** introduire un DTO | préparation seule | Générer un squelette et un `TODO`. **Jamais** un DTO aux mêmes champs que le modèle : le lint passerait au vert et la dette deviendrait invisible |
| **X4** transit | non | Déplacer la composition chez chaque consommateur est de la conception |

---

## 7. Le type

Le typage rapporte plus sur l'API interne qu'ailleurs dans le dépôt, parce que c'est le seul contrat
que plusieurs équipes lisent.

```ts
export type UserDTO = {
  readonly id: number;
  readonly firstName: string;
  readonly lastName: string;
};

export const getActiveByUserIds: (params: { userIds: number[] }) => Promise<UserDTO[]> = async ({ userIds }) => { … };
```

Le typage apporte deux bénéfices, sur deux des invariants de rentabilité forte.

**`P1` devient en partie structurel.** Un type de retour explicite fixe la forme du contrat. Le compilateur
refuse un objet auquel il manque un champ du DTO, ou dont un champ a le mauvais type. Il accepte en
revanche un modèle qui a plus de champs que le DTO, parce que le typage est structurel. Seul un DTO
construit explicitement empêche le modèle de fuir.

**`P6` devient visible.** Un changement de contrat devient un changement de type, donc un changement
revu, et non un renommage discret dans un objet littéral.

Une API en `.ts` qui importe ses usecases depuis des `.js` ne vérifie que la forme de son propre DTO.
C'est précisément ce que `P1` protège, donc le bénéfice existe même quand l'amont n'est pas migré.
Contrairement aux usecases, l'API interne est donc un candidat de migration précoce.

Le typage ne couvre pas `X5`. Un DTO typé peut recopier le modèle champ par champ, et le compilateur
n'a rien à dire.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Fonction d'API interne | **unitaire**, usecase substitué | uniquement le mapping du modèle vers le DTO |
| DTO | **unitaire pur** | la forme produite, les renommages, les mises en forme |
| Contrat vu du consommateur | **unitaire** côté consommateur, API substituée | le mapping du DTO vers son vocabulaire local. Voir `fiche-repository.md` |

L'existence du fichier de test se vérifie en comparant les noms. Moyens et limites au § 6 de
`fiche-repository.md`.

Le test d'une API interne ne doit **pas** rejouer la logique du usecase. Il vérifie la traduction, et
rien d'autre. S'il faut des fixtures métier pour faire passer ce test, `P1` ou `P2` est violé.

Un indice de diagnostic, avec sa limite. Une API dont le test unitaire n'a rien à vérifier ne traduit
rien, donc elle expose probablement le modèle du domaine. Limite : une fonction qui renvoie un
scalaire ou rien n'a pas de traduction à tester, comme au § 3 de `fiche-repository.md`.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, comme au § 4.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle ou le script correspondant existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est connu.

```
[ ] [partiel] P1  Aucun return ne rend directement un modèle du domaine
[ ] [humain]  P1  Le DTO ne recopie pas le modèle champ par champ, sauf coïncidence délibérée — voir X5
[ ] [auto]    P2  Chaque fonction passe par un usecase, jamais par un repository
[ ] [humain]  P6  Aucun renommage ni retrait sans avoir listé les contextes consommateurs
[ ] [partiel] P3  Chaque fonction exportée est documentée ; le fichier API.md régénéré est identique à celui du dépôt
[ ] [auto]    P8  Aucun import d'un autre contexte : ni repository, ni API tierce
[ ] [humain]  P7  Aucun paramètre ni branche qui dépend de l'identité de l'appelant
[ ] [humain]  P4  Le DTO ne porte aucune règle métier, seulement de la mise en forme
[ ] [auto]    P5  Le DTO est dans application/api/models/
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui de l'API
[ ] [humain]  Test unitaire avec usecase substitué, portant sur le mapping seul
```

À terme, il reste sept lignes : deux `[partiel]` et cinq `[humain]`. La plus importante est la
deuxième : `P1` a une règle et un typage, et ni l'un ni l'autre ne voit un DTO qui recopie le
modèle. Cette violation passe au vert sur tous les outils, et elle annule le bénéfice de la couche.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche elle-même | Pix : **ADR 55**, qui décide les APIs internes synchrones, expose le raisonnement et **énumère les coûts acceptés** : complexité d'injection, données de test à fournir aux consommateurs, boilerplate, duplication des modèles | ADR 55 |
| **P1** un DTO, jamais le modèle | Evans, *DDD*, ch. « Maintaining Model Integrity » : **Published Language** et **Open Host Service**. Pix : ADR 55, qui accepte la duplication comme contrepartie | *DDD Reference*, PDF gratuit ; ADR 55 |
| **P2** passe par un usecase | Pix : **ADR 20**. Martin, *Clean Architecture*, ch. « Business Rules » | ADR 20 ; le livre de 2017 |
| **P3** contrat documenté | Evans, même ch. : un Published Language est par définition documenté. Pix : la **documentation liée à l'ADR 55** donne le script de génération et l'emplacement du fichier produit | *DDD Reference* ; le lien en fin d'ADR 55 |
| **P4** DTO sans comportement | Evans, ch. « A Model Expressed in Software » : Value Object. Énoncés dans `fiche-objet-valeur.md` | *DDD Reference* |
| **P5** emplacement du DTO | **documentation liée à l'ADR 55** : dossier `api` dans la couche application, sous-dossier `models` pour les classes de contrat. Page Confluence de l'espace EDTDT, donc hors du dépôt | le lien en fin d'ADR 55 |
| **P6** stabilité du contrat | Evans, ch. « Maintaining Model Integrity ». Vernon, *IDDD*, ch. « Integrating Bounded Contexts » | *DDD Reference* ; dddcommunity.org |
| **P7** indépendance de l'appelant | **aucune source.** Déduction : une API qui dépend de son appelant n'est pas un Open Host Service | — |
| **P8** pas de transit | **aucune source.** Déduction de la Context Map d'Evans : le graphe déclaré doit décrire le graphe réel | — |

**Deux invariants sur huit n'ont aucune source** : `P7` et `P8`, tous deux des déductions explicites.
`P5` a une source : la documentation liée à l'ADR 55 fixe l'emplacement du DTO.

Cette source est hors du dépôt. Une page Confluence peut changer sans que rien ici ne le signale, et
l'ADR 55, qui y renvoie, ne reproduit pas la décision.
