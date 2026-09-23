# Fiche — Read-model

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - Le classement des fichiers de `read-models/` selon les quatre tests du § 1 n'est pas fait. C'est le
>   travail que décrit X1. Il conditionne la règle de RM3 au § 6.
> - RM1 n'a aucun moyen de vérification déterministe. C'est l'invariant le plus risqué : distinguer une
>   dérivation de présentation d'une règle métier n'est pas décidable.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants propres** — classés par ROI, comme au § 4.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**RM1**](#rm1-aucune-règle-métier) | aucune règle métier | **forte** | aucun moyen — indécidable |
| [**RM3**](#rm3-nentre-pas-dans-une-règle) | n'entre pas dans une règle | moyenne | `dependency-cruiser`, après X1 |
| [**RM4**](#rm4-emplacement) | emplacement | moyenne | script |
| [**RM2**](#rm2-aucune-validation) | aucune validation | hygiène | signal ESLint |

[**Invariants communs**](#les-cinq-invariants-communs), énoncés au § 2 de `fiche-objet-valeur.md` :
`V1` immuabilité, `V2` aucune identité, `V4` pureté, `V6` aucun cycle de vie propre, `V7` exposition
en lecture seule.

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-un-dossier-pour-trois-natures-dobjets) | un dossier pour trois natures d'objets | **à corriger** |
| [**X2**](#x2-le-mot-read-model-vient-de-cqrs) | le mot `read-model` vient de CQRS | à surveiller |
| [**X3**](#x3-lobjet-est-immuable-alors-que-rien-ne-lexige) | l'objet est immuable alors que rien ne l'exige | rien à faire |

Pour savoir si un objet est un read-model ou un Value Object, voir les quatre tests au § 1 de
`fiche-objet-valeur.md`.

---

## 1. Rôle

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
    return available < 0 ? 0 : available;
  }
}
```

Aucun concept du métier ne s'appelle « statistiques de places » : c'est le contenu d'un écran. Les
trois accesseurs sont des **dérivations de présentation** : des soustractions et des sommes sur des
données déjà chargées. Ils ne décident rien, ils mettent en forme. Le `id` concaténé n'identifie rien :
il satisfait le store du front, qui exige une clé.

### Ce que le mot désigne, et ce qu'il ne désigne pas

`read-model` est le mot de l'équipe et reste en usage pour cette raison. Il désigne ici ce que Fowler
appelle un **Data Transfer Object** : DDD n'a aucun nom pour cet objet, voir le § 10.

Il ne désigne **pas** le read model de CQRS. CQRS suppose un store séparé, alimenté par des événements,
avec une cohérence à terme. Rien de tel ici : même base, même transaction. Le test pour décider :
existe-t-il un store distinct alimenté par des événements ? Détail dans `references-ddd.md`, section
« Read model ».

### Ce qu'un read-model n'est pas

Si le code correspond à une ligne, ce n'est pas un read-model.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| porte une règle qu'une décision du domaine lit | un Value Object, dans `domain/models/` | `fiche-objet-valeur.md` |
| a besoin d'être retrouvé, suivi, mis à jour dans le temps | une Entity | `fiche-entite.md` |
| décrit le contrat d'échange avec un autre contexte | `application/api/` | `fiche-api-interne.md` |
| met en forme pour une réponse HTTP, clé de présentation comprise | `infrastructure/serializers/` | `fiche-serialiseur.md` |
| assemble les données | un repository | `fiche-repository.md` |

La première ligne est le cas fréquent et le seul difficile. Pour la reconnaître, voir les quatre tests
au § 1 de `fiche-objet-valeur.md`.

Une dérivation de présentation (un total, un pourcentage, un libellé composé) n'est pas une règle
métier. Un read-model peut donc porter des méthodes sans devenir un Value Object. La question n'est
pas « a-t-il du comportement ? » mais « ce comportement décide-t-il quelque chose ? »

---

## 2. Invariants

### Les cinq invariants communs

Un read-model est immuable, sans identité, pur, sans cycle de vie propre. Il n'expose rien en écriture.
Ces cinq invariants sont énoncés au § 2 de `fiche-objet-valeur.md` : V1, V2, V4, V6, V7, avec leurs
illustrations et ce qui casse. Ils s'appliquent tels quels et ne sont pas répétés ici.

Une nuance de source, sans effet sur l'énoncé : ils y sont fondés sur le Value Object d'Evans. Un
read-model n'en est pas un. Pour lui, l'immuabilité et l'absence d'identité sont une **convention
Pix** posée sur le DTO de Fowler, qui n'exige ni l'une ni l'autre. L'énoncé est le même, l'autorité
derrière ne l'est pas. Voir § 10.

Le cas de la clé de présentation, qui se rencontre surtout ici, est traité au § 2 de
`fiche-objet-valeur.md`, sous V2.

### RM1. Aucune règle métier

Sa valeur est sa forme. Une règle métier placée dans un read-model devient invisible depuis le domaine.

```js
// conforme — dérivation de présentation : une soustraction, plancher à zéro
get available() {
  const available = this.total - this.occupied;
  return available < 0 ? 0 : available;
}

// fautif — une décision métier, invisible depuis le domaine
get hasReachedMaximumPlacesLimit() {
  if (!this.#isMaximumPlacesLimitEnabled || this.occupied === 0) return false;

  const thresholdLock = config.features.organizationPlacesManagementThreshold;
  const maximumPlaces = this.total + this.total * thresholdLock;
  return this.occupied >= maximumPlaces;
}
```

Les deux accesseurs vivent dans le même fichier et tiennent en quelques lignes. Le premier n'utilise
que des données déjà chargées. Le second est fautif pour trois raisons cumulées :

- un seuil fixé par le métier ;
- un drapeau qui ouvre ou ferme la règle ;
- une lecture de la configuration, qui viole aussi `V4`.

Cette limite de places décide vraiment : une inscription est refusée quelque part quand elle est atteinte. La
décision se prend donc à deux endroits. Le domaine ne voit pas l'un des deux.

**Ce qui casse.** La règle sera réécrite dans le domaine, différemment. Les deux divergeront sans que
rien ne le signale.

### RM2. Aucune validation

C'est une projection de données déjà lues par notre propre requête. Les valider est redondant. L'échec
n'aurait pas de traitement sensé : l'application ne refuse pas une donnée qu'elle vient de lire dans
sa propre base.

```js
// conforme — une projection sans validation
class Country {
  constructor({ code, name, matcher }) {
    this.code = code;
    this.name = name;
    this.matcher = matcher;
  }
}

// fautif — un read-model qui valide ce que notre propre requête vient de lire
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

La fonction s'appelle `validateEntity`. C'est le bon indice : le schéma décrit **ce que la table
garantit déjà** (une date d'activation obligatoire, un identifiant numérique). Si la lecture ramenait
autre chose, lever ici ne changerait rien au problème. Cela casserait seulement l'affichage.

**L'exception.** Un objet construit à partir d'une source externe (l'API d'un autre contexte, un
service tiers) n'est plus une projection de données de confiance. Traduire redevient nécessaire. C'est
le travail du repository, invariant I1 de `fiche-repository.md`.

**Ce qui casse.** Une validation ici double celle du domaine sans la remplacer. Elle lève sur un
chemin de lecture où personne ne sait quoi en faire.

### RM3. N'entre pas dans une règle

Un read-model sort du domaine. Il n'y rentre pas comme paramètre d'une décision.

Cet invariant est un **test de classement**, pas une interdiction. Si une règle lit ses valeurs pour
décider, l'objet n'est pas un read-model. C'est un Value Object : V3 et V5 s'appliquent à lui. Le cas
se rencontre avec le candidat évalué par une Specification, voir `fiche-specification.md`.

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

Le calcul lui-même est du domaine. Distinguer deux élèves homonymes, en gardant le minimum de lettres
du nom de famille, est une règle, et une bonne. Ce qui est fautif est **le type de retour** : le modèle
décide de la forme que verra le front. Le même calcul, renvoyant les valeurs sans les emballer,
laisserait le repository ou le usecase composer la sortie.

**Ce qui casse.** Une règle qui décide à partir d'une forme non validée décide à partir de n'importe
quoi. C'est la conséquence directe de RM2 : sans validation, aucune garantie n'accompagne les valeurs.

### RM4. Emplacement

`domain/read-models/`, frère de `domain/models/`.

```
// conforme — les deux dossiers sont frères
domain/models/
domain/read-models/

// fautif — un read-model rangé comme un modèle du domaine : aucune règle ne le lit, sa forme est
// assemblée pour un écran d'administration
domain/models/TargetProfileSummaryForAdmin.js
```

Un read-model ne se range pas dans un dossier qui promet autre chose, `aggregates/` en particulier. Le
mot annonce une frontière de cohérence et des invariants tenus. Un read-model n'a ni l'une ni les
autres. Un tel dossier existe déjà : sous `domain/models/`, `aggregates/` regroupe des objets qui
tiennent des invariants entre plusieurs Entities liées. Un read-model n'y a pas sa place.

**Pourquoi sous `domain/` alors qu'il n'appartient pas au modèle du domaine.** La raison est
structurelle, pas taxonomique. Un repository le construit et un usecase le renvoie. Le placer sous
`application/` ferait dépendre l'infrastructure de l'application, ce que la règle de dépendance
interdit. Le rangement suit la direction des dépendances, pas une catégorie DDD. Aucune catégorie DDD
n'existe pour cet objet.

**Ce qui casse.** Deux dossiers frères rendent RM3 vérifiable par une règle de chemin. Un read-model
rangé ailleurs sort de la portée de cette règle sans que rien ne le dise.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Le read-model est anémique | **autorisé** — c'est RM1, et non une dérive du modèle anémique |
| Le read-model ne valide pas | **autorisé** — c'est RM2 |
| Il porte un total, un pourcentage, un libellé composé | **autorisé** — dérivation de présentation, RM1 |
| Il est construit depuis une source externe | **autorisé** — le repository traduit et valide la source, pas le read-model. C'est l'exception de RM2 |
| Il porte l'identifiant d'autre chose | **autorisé** — c'est une donnée, pas son identité. Voir V2 |
| Il n'a aucune dérivation et se réduit à une forme | **toléré** : ne se signale pas seul, car nommer le contrat d'une requête peut suffire. Voir § 8 |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **RM1** aucune règle métier | **forte** | Empêche qu'une règle du domaine vive hors du domaine, où elle sera réécrite |
| **RM3** n'entre pas dans une règle | moyenne | Empêche une décision prise à partir d'une forme non validée. Sert aussi de test de classement |
| **RM4** emplacement | moyenne | Deux dossiers frères, donc RM3 devient vérifiable par une règle de chemin |
| **RM2** aucune validation | hygiène | Évite qu'un relecteur signale l'absence de validation sur chaque read-model |

RM4 est classé en rentabilité moyenne, pas en hygiène. Un invariant de rangement vaut d'habitude moins.
Ici, l'emplacement rend un autre invariant vérifiable.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si un read-model méritait d'exister plutôt que de rester un objet littéral.
La question se pose au § 8. Elle reste de jugement.

Ils ne disent pas non plus **quelle** forme un écran devrait recevoir. Un read-model trop large fait
transiter des champs que personne n'affiche. Trop étroit, il oblige à un second aller-retour. Ce
compromis appartient au besoin, pas à l'architecture.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Un dossier pour trois natures d'objets | dérive | Le classement est invisible : un Value Object mal rangé ne se distingue pas d'un read-model. RM3 ne peut pas devenir bloquant | Aucun | **À corriger** |
| **X2** Le mot `read-model` vient de CQRS | convention assumée | Collision avec un concept distinct : qui connaît CQRS suppose un store séparé et de la cohérence à terme | Le mot est en usage et compris de l'équipe. C'est l'Ubiquitous Language. Renommer toucherait de nombreux fichiers | *À surveiller* |
| **X3** L'objet est immuable alors que rien ne l'exige | convention assumée | Champs privés et accesseurs à écrire pour un objet qui ne fait que sortir | Uniformité avec les Value Objects, et une seule règle de lint pour les deux | *Rien à faire* |

### X1. Un dossier pour trois natures d'objets

**Ce que dit la théorie.** Un dossier nommé annonce une catégorie, donc des invariants. Trois
catégories aux invariants opposés sous un même nom rendent le classement invisible.

**Exemple concret.** Le même mot désigne deux choses à deux emplacements :

```
domain/read-models/          → assemblé par une requête, traverse le domaine, sort
application/api/read-models/ → contrat publié vers un autre contexte
```

Sous le premier dossier, deux natures se mélangent. Certains objets sont lus par une règle : ce sont
des Value Objects, qui doivent satisfaire V3 et V5. D'autres ne font que sortir.

**Correction.** Classer, pas renommer. Le classement est tout le bénéfice. Le nom du dossier n'y
change rien, voir X2.

1. Un objet qu'une règle lit est un **Value Object**. Il va dans `domain/models/` et doit satisfaire
   V3 et V5. C'est le déplacement qui coûte. C'est aussi celui qui rapporte : il révèle lesquels de ces
   objets font du travail de domaine.
2. Un objet assemblé pour sortir reste un **read-model**, dans `domain/read-models/`. Rien à faire.
3. Le contrat publié vers un autre contexte est un **DTO de contrat**. Il relève de
   `fiche-api-interne.md`. Le mot `read-model` y est trompeur.

Le classement se fait fichier par fichier, par les quatre tests du § 1 de `fiche-objet-valeur.md`.

Ce que la correction débloque : RM3 par une règle de chemin. La règle **peut déjà s'écrire** : les
deux dossiers sont frères. Mais elle se déclencherait aujourd'hui sur les Value Objects mal rangés. Elle
ne peut donc pas être bloquante avant le classement.

Migration opportuniste, conforme à l'ADR 20 : le neuf suit le discriminant, l'existant se classe à sa
prochaine modification.

### X2. Le mot `read-model` vient de CQRS

**Ce que dit la théorie.** Le read-model n'appartient pas au vocabulaire de DDD. La partie tactique
d'Evans liste Entity, Value Object, Service, Module, Aggregate, Factory, Repository.

Le terme vient de **CQRS**, où il désigne un modèle alimenté par un store séparé, désynchronisé du
modèle d'écriture.

Ici, le mot désigne autre chose : le résultat d'une requête sur la même base, dans la même transaction.
C'est la *use case optimal query* de Vernon. Son objet transporté est un **DTO** au sens de Fowler.

**Exemple concret.** Le malentendu apparaît chez quelqu'un qui connaît CQRS. Le mot lui promet un
store séparé, une projection alimentée par des événements, et de la cohérence à terme. Il n'y a rien
de tout ça ici.

**Correction.** Aucune sur le mot. Le renommage a été écarté.

Deux raisons justifient ce choix.

Le mot est celui de l'équipe. **L'Ubiquitous Language est la langue de l'équipe**, pas celle du livre.
Renommer au nom de la rigueur du vocabulaire irait contre l'Ubiquitous Language, qui est justement
une règle de vocabulaire.

Le renommage n'apporte rien à l'outillage. `domain/models/` et `domain/read-models/` sont déjà des
dossiers frères, donc la règle de chemin de RM3 peut déjà s'écrire. Ce qui la bloque, c'est le
classement, pas le nom.

Le § 1 précise ce que le mot désigne et ce qu'il ne désigne pas.

**Révision.** Deux faits changent ce verdict : un malentendu constaté sur pièces, ou l'introduction
réelle d'un read model CQRS. Un read model CQRS et le read-model Pix ne peuvent pas porter le même
nom.

### X3. L'objet est immuable alors que rien ne l'exige

**Ce que dit la théorie.** Le DTO de Fowler est un porteur de données. Rien dans le patron n'exige
l'immuabilité ni l'absence d'identité : ce sont des propriétés du Value Object d'Evans, qui est une
autre catégorie.

**Exemple concret.** Un read-model écrit comme un Value Object, avec le coût d'écriture que cela
suppose :

```js
class PlacesLot {
  #id;
  #activationDate;

  constructor(params = {}) {
    this.#id = params.id;
    this.count = params.count;                       // public
    this.organizationId = params.organizationId;     // public
    this.#activationDate = params.activationDate;
  }

  get id()             { return this.#id; }
  get activationDate() { return this.#activationDate; }
}
```

La moitié des champs sont privés avec accesseur, l'autre moitié publique. Le coût d'écriture est
payé (six lignes pour deux champs). Le bénéfice n'est pas obtenu : l'objet reste modifiable par les
deux champs restants.

Un objet littéral gelé rendrait le même service à cet endroit précis.

**Correction.** Aucune sur le principe. Les deux champs publics de l'exemple, eux, violent V1 et se
corrigent : X3 ne porte que sur le choix d'écrire un read-model comme un Value Object. Le coût est
réel mais faible. Le bénéfice est une uniformité utile : une seule règle de lint couvre V1 et V7 pour
les deux catégories. Exempter les read-models demanderait à cette règle de distinguer les deux, ce que
X1 rend impossible aujourd'hui.

C'est une convention explicite, pas une lecture de Fowler : il n'exige pas l'immuabilité.

---

## 6. Vérification déterministe

Les taux de faux positifs annoncés sont estimés. Toute hypothèse sur le comportement d'un outil se
vérifie par contre-épreuve :

- introduction de la violation ;
- confirmation que l'outil la signale ;
- retrait de la violation.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **RM3** n'entre pas dans une règle | règle `dependency-cruiser` de chemin | configuration seule | **après X1** — avant le classement, la règle se déclenche aussi sur les Value Objects mal rangés |
| **RM4** emplacement | script `tests/tooling/` : aucun homonyme d'un read-model hors de `read-models/` | ~20 lignes | faibles |
| **§ 8** un fichier de test existe | même script | ~15 lignes de plus | aucun |
| **RM2** aucune validation — signal | règle ESLint : un `throw` dans un fichier de `read-models/` | ~15 lignes | faibles |
| **RM1** aucune règle métier | aucun moyen : distinguer une dérivation de présentation d'une règle métier n'est pas décidable | — | — |
| **V1**, **V2**, **V4**, **V6**, **V7** communs | voir § 6 de `fiche-objet-valeur.md` | — | — |

### RM3 — une règle de chemin

La règle s'écrit telle quelle : les deux dossiers sont déjà frères.

```js
{
  name: 'domain-rule-must-not-import-read-model',
  severity: 'error',
  from: { path: 'src/.+/domain/(models|services)/' },
  to: { path: 'src/.+/domain/read-models/' },
}
```

Elle attrape des cas réels, mais pas ceux que son nom annonce. Ce sont surtout des **modèles du domaine
qui fabriquent des read-models**, pas des règles qui en lisent un. Le sens de la flèche est inversé,
mais le couplage est le même : un modèle du domaine connaît la forme d'une sortie.

Deux pièges :

- Seul `error` fait échouer la commande, et la valeur par défaut est `warn`. `error` est la valeur
  cible. Tant que X1 n'est pas corrigé, la règle reste en `warn`.
- Le chemin s'écrit `src/.+/`, pas `src/[^/]+/`. Avec la seconde forme, la règle n'atteint pas les
  contextes à sous-contextes. Elle ne s'y déclenche jamais, sans aucun message.

Ce qui empêche de la rendre bloquante n'est pas le nommage, mais le classement. Un Value Object rangé
dans `read-models/` déclenche la règle alors qu'il est légitime. En `warn`, la règle produit la liste
des fichiers à classer. Elle passe en `error` après X1.

### RM2 signal — un `throw` dans un read-model

Syntaxique et local au fichier. Un read-model ne valide pas, donc il ne lève pas d'erreur de
validation. Même pour une source externe, la validation revient au repository (I1 de
`fiche-repository.md`), pas au read-model.

La règle ne prouve pas la violation : elle désigne où regarder.

### RM4 et l'existence des tests — un script

Le script parcourt les fichiers de `read-models/`. Deux vérifications :

- **RM4** : aucun fichier hors de `read-models/` ne porte le nom d'un read-model. Le script ne
  repère donc que les homonymes. Un read-model rangé ailleurs sous un nom unique, comme l'exemple
  fautif de RM4, lui échappe : ce cas reste à la revue. Faux positifs faibles : une homonymie avec une
  Entity est possible.
- **§ 8** : chaque fichier a un fichier de test. La correspondance se fait sur le **nom de base**,
  après retrait du suffixe de test, pour deux raisons :
  - le fichier peut vivre dans un sous-dossier alors que son test est au premier niveau
  - le suffixe de test n'est pas le même partout

  La comparaison détecte les deux sens :
  - un read-model sans test
  - un test dont aucun read-model ne porte le nom, ce qui attrape la faute de frappe dans un nom de
    fichier de test

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **RM3**, en avertissement, pour produire la liste des fichiers à classer
2. **X1 classement**, fichier par fichier, par les quatre tests
3. **RM3 en `error`**, une fois la liste vidée
4. **RM4 + existence des tests**, un seul script de complétude
5. **RM2 signal**, dernier, son bénéfice étant le plus faible

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X1** classement | préparation seule | Déplacer un fichier et réécrire ses imports, oui. Décider s'il est Value Object ou read-model, non |
| **RM1** règle métier déplacée | non | Décider où la règle vit dans le domaine est de la conception |

Sur X1, un codemod ne doit pas « corriger » un objet reclassé en Value Object en lui ajoutant une
validation vide. Le lint passerait au vert, et la dette deviendrait invisible. Le codemod produit un
`TODO` et un squelette.

---

## 7. Le type

Un read-model est un **type structurel**. Sa forme est son contenu. Une autre forme identique peut lui
être substituée : c'est voulu.

```ts
export type PlacesStatistics = {
  readonly id: string;
  readonly total: number;
  readonly occupied: number;
};
```

C'est l'inverse du choix retenu pour un Value Object, qui exige la nominalité. Voir § 7 de
`fiche-objet-valeur.md`. La raison de la différence : la nominalité protège un constructeur qui valide.
Un read-model ne valide pas.

`readonly` est effacé à la compilation : il empêche l'écriture au typage, pas à l'exécution. Si
l'immuabilité doit tenir à l'exécution, elle repose sur les champs privés d'une classe. C'est X3 au
§ 5 : une convention, pas une nécessité.

Une dérivation de présentation sur un type structurel se déclare comme une fonction séparée, pas comme
un accesseur :

```ts
export const available = (s: PlacesStatistics): number => Math.max(0, s.total - s.occupied);
```

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Read-model | **unitaire pur**, aucun double | la forme produite, et les dérivations de présentation s'il y en a |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6.

Deux indices de diagnostic :

- Un read-model qui a besoin d'un double **viole V4** : il touche à l'infrastructure. Voir V4 dans
  `fiche-objet-valeur.md`.
- Un read-model dont le test unitaire n'a rien à vérifier n'a ni forme propre ni dérivation : il
  aurait pu rester un objet littéral. Ce n'est pas une faute, c'est une question ouverte. Limite :
  nommer le contrat d'une requête est une raison suffisante d'exister, même sans dérivation.

Ce que le test unitaire ne couvre pas : que la requête produise bien cette forme. C'est le test
d'intégration du repository qui le vérifie. Voir § 8 de `fiche-repository.md`.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, comme au § 4.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle correspondante existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est connu.

Les cinq dernières lignes reprennent les invariants communs, énoncés dans `fiche-objet-valeur.md`.

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

À terme, il reste dix lignes. Trois sont de jugement : RM1, la pureté du test, et le rappel sur la
dérivation. Les sept lignes `[partiel]` restent, réduites à ce que leur règle ne couvre pas. RM1 est
le cœur de la fiche, et il est indécidable. Aucun outil ne pourra donc vérifier l'essentiel de cette
catégorie.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La catégorie elle-même | DDD n'a pas de nom pour cet objet. Le vide est logique : un objet sans comportement ni invariant n'appartient pas au modèle du domaine. Ce qui est nommé, c'est la requête (Vernon, *IDDD*, *use case optimal query*), et l'objet transporté (Fowler, *PoEAA*, Data Transfer Object) | dddcommunity.org ; *PoEAA* |
| Le mot `read-model` | Emprunté à CQRS, où il désigne autre chose. Conservé comme mot de l'équipe, voir X2 au § 5 | `references-ddd.md`, section « Read model » |
| **RM1** aucune règle métier | Déduction : Fowler condamne le modèle anémique du domaine. L'appliquer à un objet de transport serait un contresens | bliki gratuit |
| **RM2** aucune validation | **aucune source** | — |
| **RM3** n'entre pas dans une règle | Déduction de la validation à la construction : une règle qui décide à partir d'une forme non validée décide à partir de n'importe quoi | — |
| **RM4** emplacement | **aucune source**. Convention Pix en place | — |
| Immuabilité et absence d'identité | Convention Pix, pas Fowler : le DTO de *PoEAA* n'exige ni l'une ni l'autre. Les énoncés sont ceux de V1 et V2 dans `fiche-objet-valeur.md`. Leur autorité, chez Evans, porte sur le Value Object, qu'un read-model n'est pas. Voir X3 au § 5 | *PoEAA* ; *DDD Reference* |
| Un repository peut renvoyer un calcul de synthèse | Vérifié. Cela ne concerne pas cette fiche : Evans, ch. 6, autorise un repository à renvoyer un décompte ou une somme, des scalaires, pas un objet assemblé. Le passage appuie l'exception du § 3 de `fiche-repository.md` | *Final Manuscript* 2003, p. 109 |

Aucun des quatre invariants propres n'a de source directe : RM2 et RM4 n'ont aucune source, RM1 et
RM3 sont des déductions explicites. La catégorie n'existe pas dans la littérature DDD, donc c'est
cohérent. Ce sont des conventions : elles se discutent sur leurs mérites, pas par appel à une autorité.
