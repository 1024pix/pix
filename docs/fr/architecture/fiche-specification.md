# Fiche — Specification

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

À utiliser dès qu'un objet répond à la question « ce candidat satisfait-il ces critères ? » : un moteur
de règles, un ensemble de pré-requis, un prédicat métier composable et configuré par des données.

> **À instruire**
>
> - Les numéros **S3**, **S4** et **S9** ne sont pas attribués. Ils réénonçaient `V4`, puis `V1`,
>   `V2`, `V6` et `V7`, puis `V3` de `fiche-objet-valeur.md`. Les énoncés vivent là-bas, et les
>   numéros ne sont pas réattribués.
> - `X1` — la redéfinition par le consommateur — bloque la sortie du moteur en contexte borné
>   distinct. C'est l'écart le plus structurant de la fiche et le seul dont la correction est un
>   chantier de conception.
> - Le format d'une specification écrite à la main est un contrat publié. Aucune documentation
>   versionnée de ce format n'existe aujourd'hui, ce qui rend `S6` invérifiable.

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
| [**S8**](#s8-un-consommateur-ne-redéfinit-pas-la-specification) | un consommateur ne redéfinit pas la specification | **forte** | revue, puis règle après découpage |
| [**S1**](#s1-la-specification-est-totale) | la specification est totale | **forte** | test paramétré |
| [**S2**](#s2--non-satisfait--et--non-évaluable--sont-distincts) | « non satisfait » et « non évaluable » sont distincts | **forte** | revue |
| [**S6**](#s6-le-format-est-un-contrat-publié) | le format est un contrat publié | **forte** | test, après X4 |
| [**S7**](#s7-tout-critère-déclaré-est-branché-sur-le-candidat) | tout critère déclaré est branché sur le candidat | moyenne | test, dix lignes |
| [**S5**](#s5-la-composition-est-fermée) | la composition est fermée | hygiène | test de composition |

[**Invariants hérités de l'objet-valeur**](#les-invariants-hérités-de-lobjet-valeur) — les critères et
le candidat sont des objets-valeurs, donc `V1` immuabilité, `V2` absence d'identité, `V3` validation à
la construction, `V4` pureté, `V6` absence de cycle de vie et `V7` exposition en lecture seule
s'appliquent, énoncés dans `fiche-objet-valeur.md`.

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-un-consommateur-reconstruit-la-specification) | un consommateur reconstruit la specification | **à corriger** |
| [**X2**](#x2--non-satisfait--et--non-évaluable--sont-confondus) | « non satisfait » et « non évaluable » sont confondus | **à corriger** |
| [**X3**](#x3-la-specification-journalise) | la specification journalise | **à corriger** |
| [**X4**](#x4-la-résolution-dune-propriété-du-candidat-se-fait-par-nom) | la résolution d'une propriété du candidat se fait par nom | à surveiller |

Deux artefacts hors numérotation, souvent cherchés : la [table des quatre éléments](#les-quatre-éléments)
du pattern au § 1, et le [format publié](#le-format-dune-specification-pilotée-par-les-données-est-un-contrat-publié)
et ses trois conséquences.

---

## 1. Rôle

Une Specification porte un **prédicat sur un autre objet**. Elle ne fait rien d'autre : elle ne charge
pas, elle n'écrit pas, elle ne décide pas des conséquences.

### Les quatre éléments

Les nommer évite les trois quarts des confusions.

| Élément | Rôle | Catégorie | Fiche |
| --- | --- | --- | --- |
| **La specification** | l'arbre de critères. Racine d'agrégat si elle est persistée et identifiée | entité, ou racine | `fiche-racine-agregat.md` |
| **Les critères** | les feuilles et les combinateurs du prédicat | objets-valeurs | `fiche-objet-valeur.md` |
| **Le candidat** | l'objet évalué, assemblé pour l'occasion | **objet-valeur** | `fiche-objet-valeur.md` |
| **`isSatisfiedBy(candidat)`** | l'unique point d'entrée | sur la specification | — |

**Le candidat est un objet-valeur, pas un read-model.** C'est le résultat du discriminant énoncé au
§ 1 de `fiche-objet-valeur.md` : une règle du domaine lit ses valeurs pour décider, donc le domaine
raisonne avec lui. Conséquence directe et non cosmétique : `V3` s'applique, donc le candidat **valide à
la construction** — et c'est ce qui rend `S1` tenable, puisqu'un candidat valide garantit la forme de
chacune de ses propriétés.

Ne pas le ranger dans `aggregates/`, qui promet une frontière de cohérence qu'il n'a pas. Voir `X1`
de `fiche-racine-agregat.md`.

### Plusieurs prédicats, et le prédicat vide

Une specification peut porter **plusieurs prédicats indépendants** sur le même candidat, quand le
métier distingue plusieurs questions — par exemple « cet utilisateur est-il concerné ? » et
« a-t-il accompli ce qui est demandé ? ». Chaque prédicat est un arbre distinct, évalué séparément.

Un prédicat **vide** est vrai par vacuité : une composition `all` sur une liste vide renvoie `true`.
Ce n'est pas un défaut, c'est la sémantique attendue — mais il faut le savoir, parce qu'un prédicat
vide ne cadre plus rien.

### Le format d'une specification pilotée par les données est un contrat publié

Dès qu'une specification est **écrite à la main** — JSON en base, CSV d'import, interface
d'administration — son format devient un **Published Language** au sens d'Evans. Trois conséquences :

- ses clés ne se renomment pas pour des raisons de style interne, même si elles jurent avec les
  conventions du code ;
- toute valeur ajoutée à une énumération du format est documentée avant d'être utilisable ;
- un format publié se versionne ou s'étend, il ne se casse pas.

C'est `S6`, et c'est ce qui distingue ce format de toute autre structure interne.

### Ce qu'une Specification n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une Specification.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| charge les données du candidat | un repository, puis un usecase qui assemble le candidat | `fiche-repository.md`, `fiche-usecase.md` |
| décide quoi faire du résultat | `domain/usecases/` | `fiche-usecase.md` |
| applique une règle sur un seul objet, sans composition | l'entité ou l'objet-valeur concerné | `fiche-entite.md`, `fiche-objet-valeur.md` |
| applique une règle transverse non composable, sans I/O | `domain/services/` | `fiche-service-domaine.md` |
| journalise, mesure, trace | l'appelant — voir `X3` | — |
| filtre les critères avant d'évaluer | nulle part : c'est `S8` | — |
| enrichit le candidat en cours d'évaluation | le usecase, avant l'appel | `fiche-usecase.md` |

---

## 2. Invariants

### Les invariants hérités de l'objet-valeur

Les critères et le candidat sont des objets-valeurs. **`V1`, `V2`, `V3`, `V4`, `V6` et `V7` de
`fiche-objet-valeur.md` s'appliquent** et ne sont pas répétés ici, illustrations et pièges compris —
notamment le champ public sur une classe de base abstraite, et le gel inopérant sur un objet dont
l'état est privé.

Deux d'entre eux portent un rôle particulier dans un moteur de règles.

**`V3` — validation à la construction.** C'est ce qui élimine le cas « specification malformée » au
moment de l'évaluation : un arbre invalide ne s'instancie pas, donc `isSatisfiedBy` n'a rien à
vérifier. Sans lui, `S1` et `S2` deviennent inextricables — voir la distinction des trois cas sous
`S2`. La validation vaut à **tous les niveaux** de l'arbre : la specification, les combinateurs, les
critères, les comparaisons élémentaires, chacun avec son schéma.

**`V4` — pureté.** Aucune I/O, aucun effet de bord. Le candidat entre, un booléen sort. L'entorse est
presque toujours la journalisation, et c'est `X3` au § 5, qui donne la sortie propre.

### S1. La specification est totale

**Énoncé.** `isSatisfiedBy` est définie pour **tout** candidat valide, y compris incomplet. Une donnée
absente rend `false`.

Le point sensible est toujours le même : l'accès à une propriété du candidat.

```js
// fautif — lève si la propriété est absente
check(item) {
  const value = item[this.#key];
  return value >= this.#threshold;
}

// conforme — l'absence est une réponse, pas un incident
check(item) {
  const value = item[this.#key];
  if (value === undefined) return false;
  return value >= this.#threshold;
}
```

Le candidat contribue à la totalité, et sa validation à la construction — `V3` — est ce qui la
garantit :

```js
// une projection : la propriété est toujours un objet, ses champs peuvent être undefined
this.#learner = { id: learner?.id };

// une valeur par défaut : la collection est toujours itérable
constructor({ items = [] }) { … }
```

**Ce qui casse.** Une specification mal câblée lève dans un job asynchrone, où l'exception est souvent
avalée par un `try/catch` que personne ne relit. Le défaut est silencieux et le résultat manquant est
attribué au métier.

**À éviter absolument : plusieurs modes de réponse pour la même erreur de câblage.** Si certaines
propriétés lèvent, d'autres rendent `false` par projection et d'autres `false` par collection vide, le
comportement dépend du critère écrit et le diagnostic devient impossible.

### S2. « Non satisfait » et « non évaluable » sont distincts

**Énoncé.** Une specification renvoie un booléen quand elle a pu conclure, et **signale explicitement**
qu'elle n'a pas pu conclure.

Cet invariant a longtemps semblé contredire `S1`, qui interdit de lever. La contradiction vient d'une
confusion entre trois cas, qu'il faut séparer :

| Cas | Réponse | Invariant |
| --- | --- | --- |
| Une donnée du candidat est **absente** | `false` — c'est une réponse légitime | `S1` |
| La **specification** est malformée : type de critère inconnu, comparaison inapplicable | **ne peut pas arriver** : l'arbre ne s'instancie pas | `V3` |
| Une donnée du candidat est **présente mais inexploitable** : type inattendu, valeur hors domaine | non évaluable, à signaler | **`S2`** |

Le périmètre de `S2` est donc le troisième cas, et lui seul. C'est le seul qui subsiste à l'exécution
quand `V3` est tenu, et il vient toujours de l'extérieur du domaine — une donnée chargée qui n'a pas
la forme attendue.

```js
// fautif — journalise puis renvoie false : indiscernable d'un candidat non conforme
if (typeof value !== 'number') {
  logger.error(…);
  return false;
}
```

Trois sorties possibles, **à choisir une fois pour tout le moteur** : lever une erreur du domaine,
renvoyer un résultat à trois états, ou renvoyer un booléen accompagné d'une liste de diagnostics. Le
défaut n'est pas de choisir l'une plutôt que l'autre, c'est de ne pas choisir.

**Ce qui casse.** Une specification cassée devient indiscernable d'un candidat qui ne remplit pas les
critères. Un utilisateur privé de son résultat par un défaut est traité comme un utilisateur qui n'y a
pas droit, et personne ne le sait. Voir `X2` au § 5.

### S5. La composition est fermée

**Énoncé.** Un combinateur accepte n'importe quel critère comme enfant, y compris un autre
combinateur, et propage le candidat **sans le transformer**.

```js
// conforme — le combinateur ne connaît que l'interface, pas les types concrets
isSatisfiedBy(candidate) {
  return this.#children.every((child) => child.isSatisfiedBy(candidate));
}

// fautif — il connaît ses enfants, donc la composition n'est plus fermée
isSatisfiedBy(candidate) {
  return this.#children.every((child) =>
    child.type === 'threshold' ? child.check(candidate.score) : child.isSatisfiedBy(candidate),
  );
}
```

**Ce qui casse.** Exprimer une condition métier nouvelle demande alors de modifier le moteur, ce qui
est exactement ce que le pattern sert à éviter.

Généralement déjà tenu : c'est un invariant **à protéger**, pas à conquérir. Un combinateur qui refuse
un type d'enfant, ou qui modifie le candidat avant de le passer, casse la propriété.

### S6. Le format est un contrat publié

**Énoncé.** Toute valeur ajoutée à une énumération du format est documentée **avant** d'être
utilisable, et aucune clé existante n'est renommée. Voir § 1.

**Le tiers état est le vrai danger** : une valeur qui existe dans le code sans être documentée. Ceux
qui écrivent des specifications ne peuvent pas s'en servir, et ceux qui lisent le code ne savent pas si
elle est supportée. Soit la documentation rattrape, soit le code retire.

**Ce qui casse.** Renommer une clé casse les specifications déjà écrites — en base, dans des imports,
dans une interface d'administration — donc du contenu que le code ne contrôle pas et ne peut pas
migrer seul.

**Prérequis de vérification.** L'invariant n'est contrôlable que si une documentation versionnée du
format existe dans le dépôt. Elle n'existe pas.

### S7. Tout critère déclaré est branché sur le candidat

**Énoncé.** Quand la résolution d'une propriété du candidat se fait **par nom**, l'énumération des
noms autorisés et la surface du candidat forment un contrat implicite. Il doit être vérifié.

Le protocole d'ajout d'un critère comporte plusieurs étapes dans plusieurs fichiers : exposer la
propriété sur le candidat, enregistrer le nom dans l'énumération, charger la donnée dans le repository
qui assemble le candidat. **Seule l'étape d'enregistrement est validée**, par le schéma du format. Les
autres ne le sont par rien.

**Ce qui casse.** Un nom enregistré sans donnée derrière produit une violation de `S1` : selon la
forme de la propriété, une exception ou un `false` définitif et silencieux. Le critère est écrit, il
paraît actif, et il ne l'est pas.

**L'exception à prévoir.** Un critère qui porte un algorithme — un calcul, un seuil, une agrégation —
n'utilise pas la résolution par nom mais appelle une méthode nommée du candidat. Il sort du périmètre
de `S7` et n'entre pas dans l'énumération. Le distinguer explicitement, sinon la vérification produit
un faux positif.

### S8. Un consommateur ne redéfinit pas la specification

**Énoncé.** Un consommateur **évalue** une specification, ou n'en fait rien. Il ne choisit pas quels
critères comptent.

Les trois degrés de violation, du moins au plus grave :

```js
// 1. il lit la forme interne du format
const ids = spec.criteria.map(({ data }) => data.someId.value);

// 2. il évalue une feuille isolée
const done = criterion.isSatisfiedBy(candidate);

// 3. il reconstruit la specification avec un sous-ensemble
const filtered = spec.criteria.filter(/* … */);
return new Specification({ ...spec, criteria: filtered }).isSatisfiedBy(candidate);
```

**Ce qui casse.** Le troisième est rédhibitoire : aucune API publiée ne peut exposer « réinstancie mon
agrégat avec d'autres critères ». Tant que `S8` est violé, le moteur ne peut pas devenir un contexte
borné distinct de ses consommateurs, et l'ADR 55 reste inapplicable à cette frontière.

Le besoin métier derrière est souvent légitime — un critère qui ne doit pas bloquer dans certaines
conditions. Mais il doit devenir une **propriété explicite** du modèle du consommateur, au lieu d'un
filtrage de critères au moment d'évaluer. Voir `X1` au § 5.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un prédicat vide est vrai par vacuité | **autorisé**, c'est la sémantique de la composition `all`. Effet à connaître : plus de cadrage du candidat |
| Un critère algorithmique hors de l'énumération, appelant une méthode du candidat | **autorisé**, hors périmètre de `S7` |
| Un critère sans modalité de comparaison, quand la notion n'a pas de sens pour lui | **autorisé** — un seuil ne se compare pas « une parmi » |
| Une méthode du candidat qui rend une valeur neutre sur entrée non exploitable | **autorisé**, et c'est `S1` bien appliqué |
| Un candidat construit **en deux temps**, avec un accesseur pour la partie coûteuse à charger | **autorisé** si l'appelant renseigne avant usage. C'est une optimisation, pas une violation de `S1` — mais à documenter, sinon un relecteur la corrigera |
| Une specification aux prédicats **tous** vides | **cas dégénéré**, pas une exception. Elle est satisfaite par tout candidat. À interdire à l'écriture, pas à l'évaluation |
| Le consommateur porte une propriété qui neutralise un critère | **autorisé**, c'est la sortie de `S8` — une propriété du modèle, pas un filtrage |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **S8** pas de redéfinition par le consommateur | **forte** | C'est le préalable à toute API publiée du moteur, donc à sa réutilisation par un autre contexte |
| **S1** totalité | **forte** | Une specification mal câblée devient un test rouge au lieu d'une exception avalée dans un job |
| **S2** non satisfait ≠ non évaluable | **forte** | Un utilisateur privé de son résultat par un défaut cesse d'être indiscernable d'un utilisateur qui n'y a pas droit |
| **S6** format publié | **forte** | Les specifications déjà écrites continuent de fonctionner, et leur documentation reste vraie |
| **S7** correspondance énumération ↔ candidat | moyenne | Interdit une classe de pannes silencieuses pour dix lignes de test |
| **S5** fermeture par composition | hygiène | Exprimer une condition métier arbitraire sans toucher au moteur. Généralement déjà tenu, donc à protéger plutôt qu'à conquérir |

**Pourquoi quatre invariants sur six sont en rentabilité forte**, ce qui est inhabituel dans le
corpus : les modes de défaillance d'un moteur piloté par les données sont **silencieux et visibles par
l'utilisateur**. Ses entrées sont écrites à la main, hors du code, par des gens qui ne lisent pas les
logs ; et son évaluation a lieu dans des jobs. Un défaut ne casse rien, il produit un résultat faux
que personne ne relie à sa cause.

Les invariants hérités gardent le ROI qu'ils ont dans `fiche-objet-valeur.md`. `V3` y est en
rentabilité forte, et c'est ici que ce classement se justifie le plus : il est ce qui élimine un des
trois cas de `S2`.

### Ce que ça n'apporte pas

Aucun de ces invariants ne dit si les critères d'une specification donnée sont **les bons**, ni si les
identifiants qu'elle référence existent. La cohérence référentielle d'un format piloté par les données
est un sujet distinct, à traiter à l'écriture — pas à l'évaluation.

---

## 5. Écarts avec la théorie

Les écarts sont numérotés `X` et non `S`, qui est le préfixe des invariants de cette fiche.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Un consommateur reconstruit la specification | dérive | Aucune API publiée ne peut couvrir cet usage : le moteur ne peut pas sortir en contexte borné distinct | Le besoin métier est satisfait immédiatement, sans toucher au moteur | **À corriger** |
| **X2** « Non satisfait » et « non évaluable » sont confondus | dérive | Une specification cassée est indiscernable d'un candidat non conforme, et le défaut atteint l'utilisateur sans trace | Journaliser puis rendre `false` est plus court à écrire, et ne casse rien tout de suite | **À corriger** |
| **X3** La specification journalise | dérive | Le domaine dépend de l'infrastructure, et le coût d'évaluation cesse d'être prévisible | Réel — un moteur piloté par les données est difficile à déboguer sans trace | **À corriger** |
| **X4** La résolution d'une propriété du candidat se fait par nom | convention assumée | Rien ne garantit qu'un nom corresponde à une donnée. C'est ce qui rend `S7` nécessaire | Réel — le format s'étend sans toucher au moteur, et une specification nouvelle ne demande aucun déploiement | *À surveiller* |

L'écart « le candidat est rangé avec les agrégats » n'est pas listé ici : il est énoncé sous `X1` de
`fiche-racine-agregat.md`, où se trouve le dossier fautif.

### X1. Un consommateur reconstruit la specification

**Ce que dit la théorie.** Un contexte borné expose un contrat, pas sa forme interne. Evans traite le
sujet sous *Bounded Context* et *Anticorruption Layer* ; l'ADR 55 le décide pour Pix.

**Exemple concret.** Le troisième degré de violation de `S8` :

```js
const filtered = spec.criteria.filter((c) => !shouldIgnore(c));
return new Specification({ ...spec, criteria: filtered }).isSatisfiedBy(candidate);
```

Le consommateur ne consomme pas un service, il réassemble le modèle d'un autre.

**Correction.** Faire du besoin une **propriété explicite du modèle du consommateur**. « Ce critère ne
doit pas bloquer dans telles conditions » devient une donnée que le consommateur porte et que la
specification reçoit, au lieu d'une opération sur l'arbre.

Puis une **couche de traduction unique** entre le vocabulaire du consommateur et le format de la
specification, dans les deux sens. Elle doit couvrir **l'écriture et la lecture** : une traduction qui
ne sert qu'à créer la specification laisse le chemin de lecture accéder au format en direct, et le
couplage reste entier.

C'est un chantier de conception, pas un déplacement de fichiers. La règle `dependency-cruiser` qui
interdirait l'accès direct ne peut être écrite qu'**après** — elle est la conséquence du découpage, pas
son moyen.

### X2. « Non satisfait » et « non évaluable » sont confondus

**Ce que dit la théorie.** Evans et Fowler traitent la Specification comme un prédicat total. Ils ne
traitent pas le cas d'une specification non évaluable, donc l'écart est avec une exigence que les
sources ne formulent pas — mais que le caractère piloté par les données impose.

**Exemple concret.**

```js
if (comparisonIsInvalid) {
  logger.error(`comparaison invalide : ${this.#comparison}`);
  return false;
}
```

Le signe qui ne trompe pas : un `return false` précédé d'une journalisation. La journalisation dit que
le développeur savait que ce n'était pas une réponse.

**Correction.** Choisir une des trois sorties de `S2` — erreur du domaine, résultat à trois états,
booléen plus diagnostics — et l'appliquer partout. Le choix se fait une fois, au niveau du moteur, et
non critère par critère.

Ce qui rend la correction non mécanique : chaque site d'appel doit alors traiter le nouveau cas, et
décider ce qu'il en fait. C'est ce qui explique que l'écart perdure.

### X3. La specification journalise

**Ce que dit la théorie.** Le domaine ne dépend pas de l'infrastructure. C'est `V4`, et la règle de
dépendance de Clean Architecture.

**Exemple concret.**

```js
// dans un fichier de domain/models/ — fautif
import { logger } from '../../../shared/infrastructure/utils/logger.js';
```

**Correction, et ce n'est pas de supprimer la trace.** Le besoin est réel : un moteur piloté par les
données est difficile à déboguer sans savoir quel critère a conclu quoi. La sortie propre est de
**rendre la trace à l'appelant**.

```js
// la specification reste pure, l'appelant décide quoi faire de la trace
isSatisfiedBy(candidate) {
  return { satisfied: …, trace: [ … ] };
}
```

L'appelant — un usecase — journalise s'il le veut. La specification reste testable sans doublure, et
son coût d'évaluation redevient prévisible.

Cette correction croise `S2` : le même canal de retour peut porter les diagnostics de non-évaluabilité
et la trace de décision. Les traiter ensemble coûte moins que séparément.

### X4. La résolution d'une propriété du candidat se fait par nom

**Ce que dit la théorie.** Rien : la résolution tardive est un choix d'implémentation, pas un écart
avec le pattern. L'écart est avec la vérifiabilité.

**Exemple concret.**

```js
const value = candidate[this.#propertyName];   // #propertyName vient du format, en base
```

Le nom traverse la base de données, donc aucun outil ne peut lier la déclaration à son usage.

**Correction.** Aucune sur le principe : c'est ce qui permet d'écrire une specification nouvelle sans
déploiement, et c'est le bénéfice central du pattern piloté par les données.

Ce qui est à tenir, c'est la compensation : le test de `S7` verrouille l'étape que rien ne protège, et
il coûte dix lignes. Sans lui, la convention est payée sans sa contrepartie.

Ce qui rouvrirait le dossier : le typage. Un nom de critère typé en `keyof Candidate` plutôt qu'en
`string` rend la déclaration sans propriété impossible à la compilation — voir § 7. À ce moment-là,
`X4` cesse d'être un écart et le test de `S7` devient inutile.

---

## 6. Vérification déterministe

**Cette fiche se vérifie surtout par des tests, pas par des règles de lint**, et la raison est
structurelle : son domaine est **énumérable**. La liste des types de critères, celle des comparaisons,
la surface du candidat sont toutes finies et déclarées. On boucle dessus et on affirme une propriété,
ce qui est plus simple et plus robuste qu'une analyse d'AST.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **S7** énumération ↔ candidat | test de correspondance sur une instance | ~10 lignes | aucun |
| **S1** totalité | test de totalité paramétré sur les énumérations | ~30 lignes | aucun |
| **S5** fermeture par composition | test : un combinateur accepte chaque type d'enfant, imbrication comprise | ~20 lignes | aucun |
| **S6** format publié | test comparant les énumérations à une documentation versionnée | ~15 lignes | **impossible aujourd'hui** — la documentation n'existe pas |
| **S8** pas de redéfinition | règle `dependency-cruiser`, **après** le découpage de `X1` | configuration | — |
| **S2** | revue | — | — |
| Invariants hérités | voir § 6 de `fiche-objet-valeur.md` | — | — |

### S7 — le test le plus rentable, et l'erreur à ne pas refaire

La forme naïve est **fausse** :

```js
// FAUX — inspecte le prototype, alors que le contrat porte sur l'instance
for (const name of Object.values(CRITERION_NAMES)) {
  expect(Object.getOwnPropertyNames(Candidate.prototype)).to.include(name);
}
```

`Object.getOwnPropertyNames(Candidate.prototype)` ne voit que les méthodes et les accesseurs déclarés
sur le prototype. Un candidat qui expose ses propriétés par **champs assignés au constructeur** — la
forme montrée au § 1 — n'a rien sur son prototype, donc le test échoue sur du code correct. Et il ne
dit rien du cas inverse.

La forme juste interroge une instance :

```js
const candidate = new Candidate({});
for (const name of Object.values(CRITERION_NAMES)) {
  expect(name in candidate, `le critère « ${name} » n'a aucune propriété sur le candidat`).to.be.true;
}
```

`in` couvre les champs propres, les accesseurs du prototype et les méthodes — c'est-à-dire les trois
formes sous lesquelles une propriété du candidat peut exister. Le message d'échec nomme le critère
fautif, sans quoi la sortie est inutilisable.

Dix lignes, aucun faux positif. S'il passe déjà, c'est un test de non-régression, et c'est très bien :
il interdit une classe entière de pannes silencieuses.

**Extension plus coûteuse mais utile** : vérifier que la propriété est **renseignée** par le repository
qui assemble le candidat, pas seulement exposée. Demande une fixture, donc un test d'intégration.

### S1 — test de totalité

```js
const empty = new Candidate({});
for (const name of Object.values(CRITERION_NAMES)) {
  const criterion = buildCriterion({ name, /* … */ });
  expect(() => criterion.isSatisfiedBy(empty)).to.not.throw();
}
```

À étendre à chaque valeur de l'énumération des comparaisons, et à un candidat dont chaque propriété est
absente à tour de rôle.

**Ne pas l'étendre** aux parties du candidat volontairement chargées en deux temps — voir § 3.

### S6 — ce qui manque avant de pouvoir le tester

Le test est trivial : comparer les valeurs des énumérations du code à une liste documentée. Il n'est
pas écrivable, parce que la liste documentée n'existe pas.

C'est donc le premier travail sur cet invariant, et il n'est pas de l'outillage : produire la
documentation du format, versionnée dans le dépôt, puis le test qui l'oppose au code. Dans cet ordre.

### Ce qui n'est pas mécanisable

`S2` demande de juger si une distinction sémantique est faite au bon endroit, et le choix de la sortie
est une décision, pas une propriété vérifiable.

`S8` est un chantier de conception : la règle qui l'interdirait ne peut être écrite qu'une fois le
découpage réalisé — elle en est la conséquence, pas le moyen. C'est la différence avec les autres
lignes de cette table.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **S7** — dix lignes, sur une instance et non sur le prototype
2. **S1** — test paramétré sur les énumérations
3. **S5** — test de composition
4. **Invariants hérités** — la règle de chemin et la règle sur les champs publics, mutualisées avec
   `fiche-objet-valeur.md`
5. **S6** — documenter le format, puis le test qui l'oppose au code
6. **S2** — choisir la sortie, puis reprendre les sites d'appel
7. **S8** — après le découpage de `X1`, la règle de chemin qui le verrouille

### Codemods

Peu rentables ici, contrairement à la fiche repository.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** journalisation | préparation seule | Repérer les imports fautifs, oui. Décider du canal de retour de la trace, non |
| **X2** sortie de non-évaluabilité | non | Chaque site d'appel doit décider ce qu'il fait du nouveau cas |
| **X1** redéfinition | non | C'est de la conception |

Les corrections de cette fiche demandent chacune une décision — quelle valeur par défaut, quel canal
pour signaler l'inévaluable, que devient la trace. Le test et la règle suffisent.

---

## 7. Le type

Le pattern se type bien, et c'est un bon candidat de migration : peu de fichiers, aucune I/O,
frontière nette.

```ts
export type Candidate = {
  readonly learner?: { readonly id: number };
  readonly items: readonly Item[];
};

export type Specification<C> = {
  isSatisfiedBy(candidate: C): boolean;
};
```

Deux bénéfices, et ils portent précisément sur les invariants les plus souvent en défaut.

**`S1` devient partiellement structurel.** Un candidat aux propriétés optionnelles force le traitement
de l'absence à la compilation : sous `strict`, un accès non gardé ne compile plus. Ce qui reste à la
charge du code : la valeur présente mais hors domaine, qui est le périmètre de `S2`.

**`S7` devient structurel, et `X4` disparaît.** Le nom d'un critère typé en `keyof Candidate` plutôt
qu'en `string` rend impossible la déclaration d'un critère sans propriété correspondante. Le test de
`S7` devient alors inutile — c'est le seul endroit du corpus où le typage retire un test au lieu d'en
ajouter un.

La borne à connaître : ce bénéfice suppose que le nom vienne du code. Un nom qui vient de la base de
données reste une chaîne au moment où il arrive, et la vérification se déplace vers la validation du
format — `V3`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Specification, combinateurs, critères, comparaisons | **unitaire pur** — aucune base, aucune doublure | la logique de composition et de comparaison |
| Totalité et modes d'échec | **unitaire paramétré** sur les énumérations | `S1` et `S2`, en énumérant plutôt qu'en listant des cas |
| Le candidat et ses valeurs par défaut | **unitaire** | l'assemblage, et la forme garantie de chaque propriété |
| Correspondance énumération ↔ candidat | **unitaire** | `S7`, sur une instance |
| Les repositories qui assemblent le candidat | **intégration** | que chaque propriété est effectivement renseignée |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6 de
`fiche-repository.md`.

Deux indices de diagnostic, avec leurs bornes.

**Une specification qui a besoin d'une doublure pour être testée en unitaire viole `V4`.** La doublure
nécessaire est le symptôme, pas la solution. Cet indice est sans borne : il n'existe aucun cas où une
specification conforme en demande une.

**Un test qui liste des cas au lieu d'énumérer est un signal.** Le domaine étant fini et déclaré, un
test écrit cas par cas se périme dès qu'une valeur est ajoutée à une énumération — et personne ne le
saura. La borne : les cas limites d'une comparaison particulière se listent légitimement.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle ou
le test correspondant existe. `[partiel]` reste, réduite à ce qu'il ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

Les quatre dernières lignes reprennent les invariants hérités de `fiche-objet-valeur.md`.

```
[ ] [humain]  S8  Aucun consommateur ne filtre les critères ni ne reconstruit la specification
[ ] [auto]    S1  Aucun accès à une propriété du candidat sans traiter son absence
[ ] [humain]  S2  Une donnée présente mais inexploitable est signalée, elle ne renvoie pas false
[ ] [partiel] S6  Toute valeur ajoutée à une énumération du format est documentée
[ ] [auto]    S7  Tout critère de l'énumération a sa propriété sur le candidat ET son chargement
[ ] [auto]    S5  La composition reste fermée ; le candidat n'est pas transformé en cours de route
[ ] [auto]    V4  Aucun import d'infrastructure dans un modèle du domaine, journal compris
[ ] [humain]  V3  Validation à la construction, à tous les niveaux de l'arbre, avant affectation
[ ] [auto]    V1  Aucun champ public mutable, classe de base comprise ; aucun gel inopérant
[ ] [auto]    V7  Aucune collection interne rendue telle quelle
[ ] [humain]  Tests unitaires purs ; les tests énumèrent au lieu de lister des cas
[ ] [humain]  Avant de signaler S1 ou S7, vérifier les exceptions du § 3
```

À terme il reste cinq lignes, toutes de jugement : `S8`, `S2`, `V3`, la forme des tests et le rappel
des exceptions. `S8` et `S2` sont les deux écarts dont la correction est une décision, pas un
déplacement — c'est cohérent avec le § 5.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| Le cadrage — c'est une Specification, pas un modèle ordinaire | Evans, *DDD*, ch. « Making Implicit Concepts Explicit » | Evans & Fowler, PDF gratuit |
| **S1** totalité | Evans & Fowler, « Specifications » | <https://martinfowler.com/apsupp/spec.pdf> |
| **S2** non satisfait ≠ non évaluable | **aucune source.** Les sources traitent la Specification comme un prédicat total et ne traitent pas le cas d'une donnée présente mais inexploitable | — |
| **S5** fermeture par composition | Evans & Fowler, « Specifications » — la composition y est explicite | même PDF |
| **S6** format publié | Evans, *DDD*, ch. « Maintaining Model Integrity » — **Published Language** | *DDD Reference*, PDF gratuit |
| **S7** énumération ↔ candidat | **aucune source.** Contrainte propre à la résolution tardive par nom, donc à `X4` | — |
| **S8** pas de redéfinition par le consommateur | Evans, même ch. — **Anticorruption Layer**, **Bounded Context**. Pix : **ADR 55** | ADR 55 ; Vernon, *IDDD*, ch. « Integrating Bounded Contexts » |
| Le candidat est un objet-valeur | Discriminant du § 1 de `fiche-objet-valeur.md`, sans source externe. Evans pour la catégorie Value Object | *DDD Reference* |
| Invariants hérités | voir § 10 de `fiche-objet-valeur.md` | — |

**Deux invariants propres sur six n'ont aucune source** : `S2` et `S7`. Ils se discutent sur leurs
mérites, pas par appel à une autorité, et ils ont la même origine — le caractère piloté par les données
du moteur, que les sources ne traitent pas.

Le cadrage est l'affirmation la plus structurante de la fiche : si un objet n'est pas une
Specification, tout ce qui précède change de nature. Le PDF gratuit d'Evans & Fowler suffit à en juger,
et c'est là qu'il faut commencer pour contester la fiche.
