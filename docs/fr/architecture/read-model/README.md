# Read-model

Un read-model est la forme assemblée pour répondre à un besoin de lecture précis. Il vit dans
`domain/read-models/`.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à tout read-model. La ligne **Vérification** de chaque
invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans la CI est dans
[`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Tests attendus](#tests-attendus) · [Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**RM1**](#rm1-aucune-règle-métier) | aucune règle métier | aucun moyen : indécidable, revue seule |
| [**RM2**](#rm2-aucune-validation) | aucune validation | règle ESLint pour le signal, revue pour le reste |
| [**RM3**](#rm3-nentre-pas-dans-une-règle) | n'entre pas dans une règle | `dependency-cruiser` |
| [**RM4**](#rm4-emplacement) | emplacement | script, partiel |

[**Invariants communs**](#les-cinq-invariants-communs), énoncés dans `../objet-valeur/README.md` :
`V1` immuabilité, `V2` aucune identité, `V4` pureté, `V6` aucun cycle de vie propre, `V7` exposition
en lecture seule.

Hors numérotation : pour savoir si un objet est un read-model ou un Value Object, voir le
discriminant et ses quatre tests dans `../objet-valeur/README.md`.

---

## Rôle

Un read-model est la forme assemblée pour répondre à un besoin de lecture précis. Un repository le
construit, souvent en joignant plusieurs tables ou plusieurs sources. Il traverse le usecase et le
contrôleur, puis sort. Le besoin d'affichage dicte sa forme, pas un concept du métier. Aucune règle du
domaine ne le lit.

```js
// la forme d'un écran, pas un concept du domaine
class PlacesStatistics {
  #placesLots;
  #placeRepartition;

  constructor({ placesLots = [], placeRepartition, organizationId } = {}) {
    // clé de présentation : elle se compose dans le sérialiseur, voir V2
    this.id = `${organizationId}_place_statistics`;
    this.#placesLots = placesLots;
    this.#placeRepartition = placeRepartition;
  }

  get total()    { return _.sumBy(this.#activePlacesLots, 'count'); }
  get occupied() { return this.#placeRepartition.totalRegisteredParticipant + …; }
  get available() {
    const available = this.total - this.occupied;
    if (available < 0) return 0;
    return available;
  }
}
```

**Code.** [`PlacesStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/read-models/PlacesStatistics.js#L5-L43), simplifié.

Termes employés dans cette page :

- **Dérivation de présentation** : un calcul qui met en forme des données déjà chargées, comme un
  total, un pourcentage ou un libellé composé. Elle ne décide rien.
- **Clé de présentation** : un identifiant fabriqué pour satisfaire le store du front, qui exige une
  clé. Il n'identifie rien.

Aucun concept du métier ne s'appelle « statistiques de places » : c'est le contenu d'un écran. Les
trois accesseurs sont des dérivations de présentation : des soustractions et des sommes sur des
données déjà chargées. Ils ne décident rien, ils mettent en forme. L'`id` concaténé est une clé de
présentation.

### Ce que le mot désigne, et ce qu'il ne désigne pas

`read-model` est le mot de l'équipe et reste en usage pour cette raison. Il désigne ici ce que Fowler
appelle un **Data Transfer Object**. DDD n'a aucun nom pour cet objet, voir
[`explication.md`](explication.md#ce-que-le-read-model-apporte).

Il ne désigne **pas** le read model de CQRS. CQRS suppose un store séparé, alimenté par des événements,
avec une cohérence à terme. Rien de tel ici : même base, même transaction. Le test pour décider :
existe-t-il un store distinct alimenté par des événements ? Détail dans `../references-ddd.md`, section
« Read model ».

### Ce qu'un read-model n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un read-model.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| porte une règle qu'une décision du domaine lit | un Value Object, dans `domain/models/` | `../objet-valeur/README.md` |
| a besoin d'être retrouvé, suivi, mis à jour dans le temps | une Entity | `../entite/README.md` |
| décrit le contrat d'échange avec un autre contexte | `application/api/` | `../api-interne/README.md` |
| met en forme pour une réponse HTTP, clé de présentation comprise | `infrastructure/serializers/` | `../serialiseur/README.md` |
| assemble les données | un repository | [`../repository/README.md`](../repository/README.md) |

La première ligne est le cas fréquent et le seul difficile. Pour la reconnaître, voir les quatre tests
du discriminant dans `../objet-valeur/README.md`.

Une dérivation de présentation n'est pas une règle métier. Un read-model peut donc porter des
méthodes sans devenir un Value Object. La question n'est pas « a-t-il du comportement ? » mais « ce
comportement décide-t-il quelque chose ? »

---

## Invariants

### Les cinq invariants communs

Un read-model est immuable, sans identité, pur, sans cycle de vie propre. Il n'expose rien en écriture.
Ces cinq invariants sont énoncés dans `../objet-valeur/README.md` : `V1`, `V2`, `V4`, `V6`, `V7`, avec
leurs illustrations et ce qui casse. Ils s'appliquent tels quels et ne sont pas répétés ici. Leur
autorité n'est pas la même que pour un Value Object : voir
[`explication.md`](explication.md#limmuabilité-et-labsence-didentité-une-convention-pix).

Le cas de la clé de présentation, qui se rencontre surtout ici, est traité sous `V2` dans
`../objet-valeur/README.md`. Une clé de présentation se compose dans le sérialiseur, pas dans le
read-model.

### RM1. Aucune règle métier

**Énoncé.** Un read-model ne porte aucune règle métier. Sa valeur est sa forme. Une règle métier placée
dans un read-model devient invisible depuis le domaine.

```js
// conforme — dérivation de présentation : une soustraction, plancher à zéro
get available() {
  const available = this.total - this.occupied;
  if (available < 0) return 0;
  return available;
}

// fautif — une décision métier, invisible depuis le domaine
get hasReachedMaximumPlacesLimit() {
  if (!this.#isMaximumPlacesLimitEnabled || this.occupied === 0) return false;

  const thresholdLock = config.features.organizationPlacesManagementThreshold;
  const maximumPlaces = this.total + this.total * thresholdLock;
  return this.occupied >= maximumPlaces;
}
```

**Code.** Conforme : [`PlacesStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/read-models/PlacesStatistics.js#L39-L43). Fautif : [`PlacesStatistics.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/read-models/PlacesStatistics.js#L49-L55).

Les deux accesseurs vivent dans le même fichier et tiennent en quelques lignes. Le premier n'utilise
que des données déjà chargées. Le second est fautif pour trois raisons cumulées :

- un seuil fixé par le métier ;
- un drapeau qui ouvre ou ferme la règle ;
- une lecture de la configuration, qui viole aussi `V4`.

Cette limite de places décide vraiment : une inscription est refusée quelque part quand elle est
atteinte. La décision se prend donc à deux endroits, et le domaine ne voit pas l'un des deux.

**Ce qui casse.** La règle sera réécrite dans le domaine, différemment. Les deux divergeront sans que
rien ne le signale.

**Vérification.** Aucun moyen : distinguer une dérivation de présentation d'une règle métier n'est pas
décidable. La règle se vérifie en revue. Voir [`outillage.md`](outillage.md#vérifications).

### RM2. Aucune validation

**Énoncé.** Un read-model ne valide pas ses données. C'est une projection de données déjà lues par
une requête du contexte : les valider est redondant. L'échec n'aurait pas de traitement sensé :
l'application ne refuse pas une donnée qu'elle vient de lire dans sa propre base.

```js
// conforme — une projection sans validation
class Country {
  constructor({ code, name, matcher }) {
    this.code = code;
    this.name = name;
    this.matcher = matcher;
  }
}

// fautif — un read-model qui valide ce que la requête du contexte vient de lire
const validationSchema = Joi.object({
  id: Joi.number().required(),
  count: Joi.number().required().allow(null),
  activationDate: Joi.date().required(),
});

class PlacesLot {
  constructor(params = {}) {
    validateEntity(validationSchema, params);
    …
  }
}
```

**Code.** Conforme pour RM2 seulement : [`Country.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/read-models/Country.js#L1-L7), dont les champs publics enfreignent `V1`. Fautif : [`PlacesLot.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/read-models/PlacesLot.js#L6-L27), simplifié : le schéma réel porte six champs.

La fonction s'appelle `validateEntity`. C'est le bon indice : le schéma décrit **ce que la table
garantit déjà** (une date d'activation obligatoire, un identifiant numérique). Si la lecture ramenait
autre chose, lever ici ne changerait rien au problème. Cela casserait seulement l'affichage.

**L'exception.** Un objet construit à partir d'une source externe (l'API d'un autre contexte, un
service tiers) n'est plus une projection de données de confiance. Traduire redevient nécessaire. C'est
le travail du repository, invariant `I1` de
[`../repository/README.md`](../repository/README.md#i1-ne-jamais-renvoyer-une-structure-de-persistance).

**Ce qui casse.** Une validation ici double celle du domaine sans la remplacer. Elle lève sur un
chemin de lecture où personne ne sait quoi en faire.

**Vérification.** Une règle ESLint signale un `throw` dans un read-model. Le signal désigne l'endroit
à relire, il ne prouve pas la violation. Le reste de l'invariant se vérifie en revue. Voir
[`outillage.md`](outillage.md#rm2-signal--un-throw-dans-un-read-model).

### RM3. N'entre pas dans une règle

**Énoncé.** Un read-model sort du domaine. Il n'y rentre pas comme paramètre d'une décision.

Cet invariant est un **test de classement**, pas une interdiction. Si une règle lit ses valeurs pour
décider, l'objet n'est pas un read-model. C'est un Value Object : `V3` et `V5` de
`../objet-valeur/README.md` s'appliquent à lui. Le cas se rencontre avec le candidat évalué par une
Specification, voir `../specification/README.md`.

Le cas symétrique, plus fréquent, est un **modèle du domaine qui fabrique le read-model** :

```js
// fautif — dans domain/models/, le modèle importe et construit une forme de sortie
import { OrganizationLearnerDTO } from '../read-models/OrganizationLearnerDTO.js';

get organizationLearners() {
  return this.#redactPrivateData();
}

#redactPrivateData() {
  return this.#organizationLearners.map((learner) => {
    const lastNamePostfix = this.#getDistinctiveLastNamePostfix(learner);
    const displayName = `${learner.firstName}${lastNamePostfix}`;
    return new OrganizationLearnerDTO({ ...learner, displayName });
  });
}

// conforme — le même calcul, sans emballer la sortie ; le repository ou le usecase compose le
// read-model à partir des valeurs renvoyées
get organizationLearners() {
  return this.#organizationLearners.map((learner) => ({
    ...learner,
    displayName: `${learner.firstName}${this.#getDistinctiveLastNamePostfix(learner)}`,
  }));
}
```

**Code.** Fautif : [`School.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/school/domain/models/School.js#L13-L23), import à la ligne 1. La forme corrigée est hypothétique.

Le calcul lui-même est du domaine. Distinguer deux élèves homonymes, en gardant le minimum de lettres
du nom de famille, est une règle, et une bonne. Ce qui est fautif est **le type de retour** : le modèle
décide de la forme que verra le front. Le même calcul, renvoyant les valeurs sans les emballer,
laisserait le repository ou le usecase composer la sortie.

**Ce qui casse.** Une règle qui décide à partir d'une forme non validée décide à partir de n'importe
quoi. C'est la conséquence directe de RM2 : sans validation, aucune garantie n'accompagne les valeurs.

**Vérification.** Une règle `dependency-cruiser` de chemin. Voir
[`outillage.md`](outillage.md#rm3--une-règle-de-chemin).

### RM4. Emplacement

**Énoncé.** Un read-model vit dans `domain/read-models/`, frère de `domain/models/`.

```
// conforme — les deux dossiers sont frères
domain/models/
domain/read-models/

// fautif — un read-model rangé comme un modèle du domaine : aucune règle ne le lit, sa forme est
// assemblée pour un écran d'administration
domain/models/TargetProfileSummaryForAdmin.js
```

**Code.** Fautif : [`TargetProfileSummaryForAdmin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/target-profile/domain/models/TargetProfileSummaryForAdmin.js#L1-L14). L'arborescence conforme est générique.

Un read-model ne se range pas dans un dossier qui promet autre chose, `aggregates/` en particulier. Le
mot annonce une frontière de cohérence et des invariants tenus. Un read-model n'a ni l'une ni les
autres : voir `A1` de `../racine-agregat/README.md`.

Le rangement sous `domain/` suit la direction des dépendances, pas une catégorie DDD : voir
[`explication.md`](explication.md#pourquoi-sous-domain).

**Ce qui casse.** Deux dossiers frères rendent RM3 vérifiable par une règle de chemin. Un read-model
rangé ailleurs sort de la portée de cette règle sans que rien ne le dise.

**Vérification.** Un script repère les homonymes d'un read-model hors de `read-models/`. Un read-model
rangé ailleurs sous un nom unique se vérifie en revue. Voir
[`outillage.md`](outillage.md#rm4-et-lexistence-des-tests--un-script).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant de sa ligne. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **RM1** | Le read-model est anémique | **autorisé** : c'est RM1, et non une dérive du modèle anémique |
| **RM1** | Il porte un total, un pourcentage, un libellé composé | **autorisé** : dérivation de présentation |
| **RM2** | Le read-model ne valide pas | **autorisé** : c'est RM2 |
| **RM2** | Il est construit depuis une source externe | **autorisé** : le repository traduit et valide la source, pas le read-model. C'est l'exception de RM2 |
| **V2** | Il porte l'identifiant d'autre chose | **autorisé** : c'est une donnée, pas son identité. Voir `V2` de `../objet-valeur/README.md` |
| forme du fichier | Il n'a aucune dérivation et se réduit à une forme | **toléré** : ne se signale pas seul, car nommer le contrat d'une requête peut suffire. Voir [Tests attendus](#tests-attendus) |

---

## Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Read-model | **unitaire pur**, aucun double | la forme produite, et les dérivations de présentation s'il y en a |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites dans
[`outillage.md`](outillage.md#rm4-et-lexistence-des-tests--un-script).

Deux indices de diagnostic :

- Un read-model qui a besoin d'un double **viole `V4`** : il touche à l'infrastructure. Voir `V4` dans
  `../objet-valeur/README.md`.
- Un read-model dont le test unitaire n'a rien à vérifier n'a ni forme propre ni dérivation : il
  aurait pu rester un objet littéral. Ce n'est pas une faute, c'est une question ouverte. Limite :
  nommer le contrat d'une requête est une raison suffisante d'exister, même sans dérivation.

Ce que le test unitaire ne couvre pas : que la requête produise bien cette forme. C'est le test
d'intégration du repository qui le vérifie. Voir
[« Tests attendus » de `../repository/README.md`](../repository/README.md#tests-attendus).

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier, aucun moyen déterministe n'est connu.

Les cinq dernières lignes reprennent les invariants communs, énoncés dans `../objet-valeur/README.md`.

```
[ ] [humain]  RM1 Aucune règle métier ; les dérivations de présentation sont admises
[ ] [partiel] RM3 N'entre pas dans le domaine comme paramètre d'une règle
[ ] [partiel] RM4 Le fichier est dans read-models/, pas dans un dossier qui promet autre chose
[ ] [partiel] RM2 Aucune validation ; une source externe se valide dans le repository
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du read-model
[ ] [humain]  Test unitaire pur, sans double
[ ] [humain]  Avant de signaler RM1, vérifier : ce comportement décide-t-il quelque chose ?
[ ] [auto]    V1  Aucun champ public ; aucune écriture après le constructeur
[ ] [partiel] V4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
[ ] [partiel] V2  Aucune clé composée ici : une clé de présentation se compose dans le sérialiseur
[ ] [partiel] V6  Aucun repository, aucune persistance propre
[ ] [partiel] V7  Aucune collection interne rendue telle quelle ; aucun gel inopérant
```

À terme, dix lignes restent : sept `[partiel]` et trois `[humain]`. Les trois lignes `[humain]` sont
RM1, la pureté du test et le rappel sur la dérivation.

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Aucun ADR ne fonde un invariant de cette page.

| Invariant | Origine |
| --- | --- |
| La catégorie elle-même | DDD n'a pas de nom pour cet objet. Fowler, *PoEAA*, Data Transfer Object ; Vernon, *IDDD*, *use case optimal query* |
| Le mot `read-model` | emprunté à CQRS, où il désigne autre chose. Conservé comme mot de l'équipe, voir `X2` de [`ecarts.md`](ecarts.md) |
| **RM1** aucune règle métier | déduction : la critique du modèle anémique, chez Fowler, ne s'applique pas à un objet de transport |
| **RM2** aucune validation | convention d'équipe, sans source |
| **RM3** n'entre pas dans une règle | déduction de la validation à la construction |
| **RM4** emplacement | convention d'équipe, sans source |
| Immuabilité et absence d'identité | convention Pix, pas Fowler. Énoncés de `V1` et `V2` dans `../objet-valeur/README.md` |
