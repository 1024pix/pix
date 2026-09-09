# Fiche — Read-model

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - Le classement des fichiers de `read-models/` selon les quatre tests du § 1 n'est pas fait. C'est le
>   travail que décrit X1, et il conditionne la règle de RM3 au § 6.
> - RM1 n'a aucun moyen de vérification déterministe identifié, et c'est l'invariant le plus exposé :
>   distinguer une dérivation de présentation d'une règle métier n'est pas décidable.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants propres**

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**RM1**](#rm1-aucune-règle-métier) | aucune règle métier | **forte** | aucun moyen — indécidable |
| [**RM2**](#rm2-aucune-validation) | aucune validation | exemption | signal ESLint |
| [**RM3**](#rm3-nentre-pas-dans-une-règle) | n'entre pas dans une règle | moyenne | `dependency-cruiser`, après X1 |
| [**RM4**](#rm4-emplacement) | emplacement | moyenne | script |

[**Invariants communs**](#les-cinq-invariants-communs), énoncés au § 2 de `fiche-objet-valeur.md` :
`V1` immuabilité, `V2` aucune identité, `V4` pureté, `V6` aucun cycle de vie propre, `V7` exposition
en lecture seule.

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-un-dossier-pour-trois-natures-dobjets) | un dossier pour trois natures d'objets | **à corriger** |
| [**X2**](#x2-le-mot-read-model-vient-de-cqrs) | le mot `read-model` vient de CQRS | à surveiller |
| [**X3**](#x3-lobjet-est-immuable-alors-que-rien-ne-lexige) | l'objet est immuable alors que rien ne l'exige | rien à faire |

L'artefact le plus cherché n'est pas dans cette fiche : le **discriminant** avec l'objet-valeur et ses
quatre tests sont au § 1 de `fiche-objet-valeur.md`, énoncés une fois pour les deux.

---

## 1. Rôle

Un read-model est la forme assemblée pour répondre à un besoin de lecture précis. Un repository le
construit, souvent en joignant plusieurs tables ou plusieurs sources. Il traverse le usecase et le
contrôleur, puis sort. Sa forme est dictée par le besoin d'affichage, pas par un concept du métier, et
aucune règle du domaine ne le lit.

```js
// la forme d'un écran, pas un concept du domaine
class CampaignOverview {
  constructor({ campaignName, organizationName, participantCount, completedCount }) { … }
  get completionRate() { return this.completedCount / this.participantCount; }
}
```

### Ce que le mot désigne, et ce qu'il ne désigne pas

`read-model` est le mot de l'équipe, et il est conservé à ce titre. Il désigne ici ce que Fowler
appelle un **Data Transfer Object** : DDD n'a aucun nom pour cet objet, voir le § 10.

Il ne désigne **pas** le read model de CQRS, qui suppose un store séparé alimenté par des événements
et de la cohérence à terme. Rien de tel ici : même base, même transaction. Le test pour trancher :
existe-t-il un store distinct alimenté par des événements ? Détail dans `references-ddd.md`, section
« Read model ».

### Ce qu'un read-model n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un read-model.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| porte une règle qu'une décision du domaine lit | un objet-valeur, dans `domain/models/` | `fiche-objet-valeur.md` |
| a besoin d'être retrouvé, suivi, mis à jour dans le temps | une entité | `fiche-entite.md` |
| décrit le contrat d'échange avec un autre contexte | `application/api/` | `fiche-api-interne.md` |
| met en forme pour une réponse HTTP, clé de présentation comprise | `infrastructure/serializers/` | `fiche-serialiseur.md` |
| assemble les données | un repository | `fiche-repository.md` |

La première ligne est le cas fréquent et le seul difficile. Le discriminant et ses quatre tests sont
au § 1 de `fiche-objet-valeur.md` : ils servent aux deux fiches, ils y sont énoncés une fois.

Rappel du piège, parce qu'il se joue ici : une **dérivation de présentation** — un total, un
pourcentage, un libellé composé — n'est pas une règle métier. Un read-model peut donc porter des
méthodes sans devenir un objet-valeur. La question n'est pas « a-t-il du comportement ? » mais « ce
comportement décide-t-il quelque chose ? »

---

## 2. Invariants

### Les cinq invariants communs

Un read-model est immuable, sans identité, pur, sans cycle de vie propre, et il n'expose rien en
écriture. Ces cinq invariants sont **énoncés au § 2 de `fiche-objet-valeur.md`** — V1, V2, V4, V6,
V7 — avec leurs illustrations et ce qui casse. Ils s'appliquent tels quels et ne sont pas répétés ici.

Une nuance de source, sans effet sur l'énoncé : ils y sont fondés sur le Value Object d'Evans. Un
read-model n'en est pas un. Pour lui, l'immuabilité et l'absence d'identité sont une **convention
Pix** posée sur le DTO de Fowler, qui n'exige ni l'une ni l'autre. L'énoncé est le même, l'autorité
derrière ne l'est pas — voir § 10.

Le cas de la clé de présentation, qui se rencontre surtout ici, est traité au § 2 de
`fiche-objet-valeur.md`, sous V2.

### RM1. Aucune règle métier

Sa valeur est sa forme. Y mettre une règle métier la rend invisible depuis le domaine.

```js
// conforme — dérivation de présentation
get completionRate() { return this.completedCount / this.participantCount; }

// fautif — une décision métier, invisible depuis le domaine
get isEligibleForCertification() { return this.score >= 80 && this.hasCompletedAllSteps; }
```

Le second exemple ne se distingue du premier ni par sa forme ni par sa longueur. Il s'en distingue
parce qu'un métier a fixé le `80`, et que ce seuil vaut ailleurs.

**Ce qui casse.** La règle sera réécrite dans le domaine, différemment, et les deux divergeront sans
que rien ne le signale.

### RM2. Aucune validation

C'est une projection de données déjà lues par notre propre requête. Les valider est redondant, et
l'échec n'aurait pas de traitement sensé : on ne refuse pas une donnée qu'on vient de lire chez soi.

**L'exception.** Un objet construit à partir d'une **source externe** — l'API d'un autre contexte, un
service tiers — n'est plus une projection de données de confiance. Traduire redevient nécessaire, et
c'est le travail du repository, invariant I1 de `fiche-repository.md`.

**Ce qui casse.** Une validation ici double celle du domaine sans la remplacer, et elle lève sur un
chemin de lecture où personne ne sait quoi en faire.

### RM3. N'entre pas dans une règle

Un read-model sort du domaine. Il n'y rentre pas comme paramètre d'une décision.

Cet invariant est un **test de classement**, pas une interdiction. Si une règle lit ses valeurs pour
décider, l'objet n'est pas un read-model : c'est un objet-valeur, et V3 et V5 s'appliquent à lui. Le
cas se rencontre avec le candidat évalué par une Specification — voir `fiche-specification.md`.

**Ce qui casse.** Une règle qui décide à partir d'une forme non validée décide à partir de n'importe
quoi. C'est la conséquence directe de RM2 : sans validation, aucune garantie n'accompagne les valeurs.

### RM4. Emplacement

`domain/read-models/`, frère de `domain/models/`.

Ne pas ranger un read-model dans un dossier qui promet autre chose, `aggregates/` en particulier : le
mot annonce une frontière de cohérence et des invariants tenus, ce qu'un read-model n'a pas.

**Pourquoi sous `domain/` alors qu'il n'appartient pas au modèle du domaine.** La raison est
structurelle, pas taxonomique. Un repository le construit et un usecase le renvoie ; le placer sous
`application/` ferait dépendre l'infrastructure de l'application, ce que la règle de dépendance
interdit. Le rangement suit la direction des dépendances, et non une catégorie DDD — il n'en existe
aucune pour cet objet.

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
| Il est construit depuis une source externe et validé | **autorisé** — c'est l'exception de RM2 |
| Il porte l'identifiant d'autre chose | **autorisé** — c'est une donnée, pas son identité. Voir V2 |
| Il n'a aucune dérivation et se réduit à une forme | **à discuter**, pas à signaler seul — nommer le contrat d'une requête peut suffire. Voir § 8 |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **RM1** aucune règle métier | **forte** | Empêche qu'une règle du domaine vive hors du domaine, où elle sera réécrite |
| **RM3** n'entre pas dans une règle | moyenne | Empêche une décision prise à partir d'une forme non validée. Et sert de test de classement |
| **RM4** emplacement | moyenne | Deux dossiers frères, donc RM3 devient vérifiable par une règle de chemin |
| **RM2** aucune validation | **exemption** | Le gain est en creux : évite qu'un relecteur signale l'absence de validation sur chaque read-model |

RM4 est classé en rentabilité moyenne et non en hygiène, contrairement à ce qu'un invariant de
rangement vaut d'ordinaire : ici l'emplacement est ce qui rend un autre invariant vérifiable.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si un read-model méritait d'exister plutôt que de rester un objet
littéral. La question se pose au § 8, et elle reste de jugement.

Ils ne disent pas non plus **quelle** forme un écran devrait recevoir. Un read-model trop large fait
transiter des champs que personne n'affiche ; trop étroit, il oblige à un second aller-retour. Ce
compromis appartient au besoin, pas à l'architecture.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Un dossier pour trois natures d'objets | dérive | Le classement est invisible : un objet-valeur mal rangé ne se distingue pas d'un read-model. RM3 ne peut pas devenir bloquant | Aucun | **À corriger** |
| **X2** Le mot `read-model` vient de CQRS | convention assumée | Collision avec un concept distinct : qui connaît CQRS suppose un store séparé et de la cohérence à terme | Le mot est en usage et compris de l'équipe. C'est l'Ubiquitous Language, et renommer coûterait une centaine de fichiers | *À surveiller* |
| **X3** L'objet est immuable alors que rien ne l'exige | convention assumée | Champs privés et accesseurs à écrire pour un objet qui ne fait que sortir | Uniformité avec les objets-valeurs, et une seule règle de lint pour les deux | *Rien à faire* |

### X1. Un dossier pour trois natures d'objets

**Ce que dit la théorie.** Un dossier nommé annonce une catégorie, donc des invariants. Trois
catégories aux invariants opposés sous un même nom rendent le classement invisible.

**Exemple concret.** Le même mot désigne deux choses à deux emplacements :

```
domain/read-models/          → assemblé par une requête, traverse le domaine, sort
application/api/read-models/ → contrat publié vers un autre contexte
```

Et, sous le premier dossier, deux natures mélangées : des objets qu'une règle lit — donc des
objets-valeurs, qui doivent satisfaire V3 et V5 — et des objets qui ne font que sortir.

**Correction.** Classer, pas renommer. Le classement est tout le bénéfice ; le nom du dossier n'y
change rien, voir X2.

1. Un objet qu'une règle lit est un **objet-valeur**. Il va dans `domain/models/` et doit satisfaire
   V3 et V5. C'est le déplacement qui coûte, et c'est celui qui rapporte : il révèle lesquels de ces
   objets font du travail de domaine.
2. Un objet assemblé pour sortir reste un **read-model**, dans `domain/read-models/`. Rien à faire.
3. Le contrat publié vers un autre contexte est un **DTO de contrat**. Il relève de
   `fiche-api-interne.md`, et le mot `read-model` y est trompeur.

Le classement se fait fichier par fichier, par les quatre tests du § 1 de `fiche-objet-valeur.md`.

Ce que la correction débloque : RM3 par une règle de chemin. La règle est **déjà écrivable**, les deux
dossiers étant frères — mais elle sortirait aujourd'hui sur les objets-valeurs mal rangés, donc elle
ne peut pas être bloquante avant le classement.

Migration opportuniste, conforme à l'ADR 20 : le neuf suit le discriminant, l'existant se classe quand
on le touche.

### X2. Le mot `read-model` vient de CQRS

**Ce que dit la théorie.** Le read-model n'appartient pas au vocabulaire de DDD. La partie tactique
d'Evans liste Entity, Value Object, Service, Module, Aggregate, Factory, Repository. Le terme vient de
**CQRS**, où il désigne un modèle alimenté par un store séparé, désynchronisé du modèle d'écriture. Ce
que désigne le mot ici est autre chose : le résultat d'une requête sur la même base, dans la même
transaction — la *use case optimal query* de Vernon, dont l'objet transporté est un **DTO** au sens de
Fowler.

**Exemple concret.** Le malentendu est à l'arrivée de quelqu'un qui connaît CQRS : le mot lui promet
un store séparé, une projection alimentée par des événements et de la cohérence à terme. Il n'y a rien
de tout ça.

**Correction.** Aucune sur le mot, et c'est un renversement de verdict assumé.

Deux raisons. Le mot est celui de l'équipe : **l'Ubiquitous Language est la langue de l'équipe**, pas
celle du livre, et imposer un terme de Fowler contre un terme d'équipe qui fonctionne se retourne
contre le principe qu'on invoquerait pour le faire. Et le renommage n'apporte **rien** sur
l'outillage : `domain/models/` et `domain/read-models/` sont déjà des dossiers frères, donc la règle
de chemin de RM3 est écrivable telle quelle. Ce qui la bloque est le classement, pas le nom.

Ce qui reste à faire, et qui coûte une phrase : écrire ce que le mot désigne localement et ce qu'il ne
désigne pas. C'est fait au § 1.

**À surveiller**, avec deux déclencheurs qui rouvriraient le dossier : un malentendu constaté sur
pièces, ou l'introduction réelle d'un read model CQRS quelque part — auquel cas les deux ne pourraient
plus porter le même nom.

### X3. L'objet est immuable alors que rien ne l'exige

**Ce que dit la théorie.** Le DTO de Fowler est un porteur de données. Rien dans le patron n'exige
l'immuabilité ni l'absence d'identité : ce sont des propriétés du Value Object d'Evans, qui est une
autre catégorie.

**Exemple concret.** Un read-model écrit comme un objet-valeur, avec le coût d'écriture que ça
suppose :

```js
class CampaignOverview {
  #campaignName;
  constructor({ campaignName }) { this.#campaignName = campaignName; }
  get campaignName() { return this.#campaignName; }
}
```

Un objet littéral gelé rendrait le même service à cet endroit précis.

**Correction.** Aucune. Le coût est réel mais faible, et le bénéfice est de l'uniformité utile : une
seule règle de lint couvre V1 et V7 pour les deux catégories, alors qu'exempter les read-models
demanderait à cette règle de savoir distinguer les deux — ce que X1 rend justement impossible
aujourd'hui.

À noter comme convention explicite, pas comme lecture de Fowler : lui n'exige pas l'immuabilité.

---

## 6. Vérification déterministe

Les taux de faux positifs annoncés sont estimés. Toute hypothèse sur le comportement d'un outil se
vérifie par contre-épreuve : introduire la violation, confirmer que l'outil sort, retirer la violation.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **RM3** n'entre pas dans une règle | règle `dependency-cruiser` de chemin | configuration seule | **après X1** — avant le classement, la règle sort aussi sur les objets-valeurs mal rangés |
| **RM4** emplacement | script `tests/tooling/` : aucun read-model hors de `read-models/` | ~20 lignes | faibles |
| **§ 8** un fichier de test existe | même script | ~15 lignes de plus | aucun |
| **RM2** aucune validation — signal | règle ESLint : un `throw` dans un fichier de `read-models/` | ~15 lignes | faibles — l'exception de la source externe |
| **RM1** aucune règle métier | aucun moyen : distinguer une dérivation de présentation d'une règle métier n'est pas décidable | — | — |
| **V1**, **V2**, **V4**, **V6**, **V7** communs | voir § 6 de `fiche-objet-valeur.md` | — | — |

### RM3 — une règle de chemin

La règle est écrivable telle quelle : les deux dossiers sont déjà frères.

```js
{
  name: 'domain-rule-must-not-import-read-model',
  severity: 'error',
  from: { path: 'src/.+/domain/(models|services)/' },
  to: { path: 'src/.+/domain/read-models/' },
}
```

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Écrire `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et la règle ne se déclenche jamais, sans erreur ni avertissement.

Ce qui empêche de la rendre bloquante n'est pas le nommage mais le classement : un objet-valeur rangé
dans `read-models/` la fait sortir alors qu'il est légitime. À activer en avertissement pour produire
la liste des fichiers à classer, puis en `error` après X1.

### RM2 signal — un `throw` dans un read-model

Syntaxique et local au fichier. Un read-model ne valide pas, donc il ne lève pas d'erreur de
validation. La règle désigne l'endroit où vérifier si l'exception de la source externe s'applique.

Elle ne prouve pas la violation : c'est sa fonction de la désigner.

### RM4 et l'existence des tests — un script

Le script parcourt les fichiers de `read-models/`. Deux vérifications :

- **RM4** : aucun fichier portant le nom d'un read-model ailleurs que dans `read-models/`. Faux
  positifs faibles — une homonymie avec une entité est possible.
- **§ 8** : chaque fichier a un fichier de test. La correspondance se fait sur le **nom de base**,
  après retrait du suffixe de test : le fichier peut vivre dans un sous-dossier alors que son test est
  à plat, et le suffixe n'est pas le même partout. La comparaison sort les deux sens — un read-model
  sans test, et un test dont aucun read-model ne porte le nom, ce qui attrape la faute de frappe dans
  un nom de fichier de test.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **RM3** — en avertissement, pour produire la liste des fichiers à classer
2. **X1 classement** — fichier par fichier, par les quatre tests
3. **RM3 en `error`** — une fois la liste vidée
4. **RM4 + existence des tests** — un seul script de complétude
5. **RM2 signal** — dernier, son bénéfice étant le plus faible

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X1** classement | préparation seule | Déplacer un fichier et réécrire ses imports, oui. Décider s'il est objet-valeur ou read-model, non |
| **RM1** règle métier déplacée | non | Décider où la règle vit dans le domaine est de la conception |

Sur X1, un codemod ne doit surtout pas « corriger » en ajoutant une validation vide à un objet
reclassé en objet-valeur : le lint passerait au vert et la dette deviendrait invisible. Il produit un
`TODO` et un squelette.

---

## 7. Le type

Un read-model est un **type structurel**. Sa forme est son contenu, et rien n'a à empêcher qu'une
autre forme identique lui soit substituée.

```ts
export type CampaignOverview = {
  readonly campaignName: string;
  readonly participantCount: number;
};
```

C'est l'inverse du choix retenu pour un objet-valeur, qui exige la nominalité — voir § 7 de
`fiche-objet-valeur.md`. La raison de la différence : la nominalité protège un constructeur qui
valide, et un read-model ne valide pas.

`readonly` est effacé à la compilation : il empêche l'écriture au typage, pas à l'exécution. Si
l'immuabilité doit tenir à l'exécution, elle repose sur les champs privés d'une classe — c'est X3 au
§ 5, et c'est une convention, pas une nécessité.

Une dérivation de présentation sur un type structurel se déclare comme une fonction séparée, pas comme
un accesseur :

```ts
export const completionRate = (o: CampaignOverview): number => …;
```

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Read-model | **unitaire pur**, aucun double | la forme produite, et les dérivations de présentation s'il y en a |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6.

Deux indices de diagnostic, avec leurs bornes.

Un read-model qui a besoin d'un double **viole V4** : il touche à l'infrastructure. Le double
nécessaire est le symptôme, pas la cause.

Un read-model dont le test unitaire n'a rien à vérifier n'a ni forme propre ni dérivation : il aurait
pu rester un objet littéral. Ce n'est pas une faute, c'est une question à poser. La borne : nommer le
contrat d'une requête est une raison suffisante d'exister, même sans dérivation.

Ce que le test unitaire ne couvre pas : que la requête produise bien cette forme. C'est le test
d'intégration du repository qui le vérifie — voir § 8 de `fiche-repository.md`.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce que la règle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

Les cinq dernières lignes reprennent les invariants communs, énoncés dans `fiche-objet-valeur.md`.

```
[ ] [humain]  RM1 Aucune règle métier ; les dérivations de présentation sont admises
[ ] [partiel] RM3 N'entre pas dans le domaine comme paramètre d'une règle
[ ] [partiel] RM4 Le fichier est dans read-models/, pas dans un dossier qui promet autre chose
[ ] [partiel] RM2 Aucune validation, sauf si la source est externe
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du read-model
[ ] [humain]  Test unitaire pur, sans double
[ ] [humain]  Avant de signaler RM1, vérifier : ce comportement décide-t-il quelque chose ?
[ ] [auto]    V1  Aucun champ public ; aucune écriture après le constructeur
[ ] [auto]    V4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
[ ] [auto]    V2  Aucune clé composée ici : une clé de cache se compose dans le sérialiseur
[ ] [partiel] V6  Aucun repository, aucune persistance propre
[ ] [partiel] V7  Aucune collection interne rendue telle quelle ; aucun gel inopérant
```

À terme il reste trois lignes, toutes de jugement : RM1, la pureté du test, et le rappel sur la
dérivation. RM1 est le cœur de la fiche et il est indécidable — c'est la borne de cette catégorie.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La catégorie elle-même | **DDD n'a pas de nom pour cet objet**, et le vide est logique : un objet sans comportement ni invariant n'appartient pas au modèle du domaine. Ce qui est nommé, c'est la **requête** — Vernon, *IDDD*, *use case optimal query* — et l'**objet transporté** — Fowler, *PoEAA*, Data Transfer Object | dddcommunity.org ; *PoEAA* |
| Le mot `read-model` | **emprunté à CQRS**, où il désigne autre chose. Conservé comme mot de l'équipe — voir X2 au § 5 | `references-ddd.md`, section « Read model » |
| **RM1** aucune règle métier | **déduction.** Fowler condamne le modèle anémique **du domaine** ; l'appliquer à un objet de transport serait un contresens | bliki gratuit |
| **RM2** aucune validation | **aucune source** | — |
| **RM3** n'entre pas dans une règle | **déduction** de la validation à la construction : une règle qui décide à partir d'une forme non validée décide à partir de n'importe quoi | — |
| **RM4** emplacement | **aucune source.** Convention Pix en place | — |
| Immuabilité et absence d'identité | **convention Pix**, pas Fowler : le DTO de *PoEAA* n'exige ni l'une ni l'autre. Les énoncés sont ceux de V1 et V2 dans `fiche-objet-valeur.md`, mais leur autorité chez Evans porte sur le Value Object, qu'un read-model n'est pas. Voir X3 au § 5 | *PoEAA* ; *DDD Reference* |
| Un repository peut renvoyer un calcul de synthèse | **vérifié**, et ça ne concerne pas cette fiche : Evans, ch. 6, autorise un repository à renvoyer un décompte ou une somme — des **scalaires**, pas un objet assemblé. Le passage adosse l'exception du § 3 de `fiche-repository.md` | *Final Manuscript* 2003, p. 109 |

Trois des quatre invariants propres n'ont aucune source directe : RM2 et RM4 aucune, RM1 et RM3 sont
des déductions explicites. C'est cohérent avec le fait que la catégorie n'existe pas dans la
littérature DDD. Ce sont des conventions : elles se discutent sur leurs mérites, pas par appel à une
autorité.
