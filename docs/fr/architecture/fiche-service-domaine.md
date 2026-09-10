# Fiche — Service de domaine

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - **Décision prise le 2026-09-08** : `domain/services/` est réservé aux vrais services de domaine.
>   Les fichiers qui font des I/O partent dans `usecases/`. `X1` au § 5 en donne la conséquence, et
>   `D1` devient activable en erreur une fois le déplacement fait. Reste à écrire dans un ADR.
> - Le numéro **D6** n'est pas attribué. Il portait « testable en unitaire pur », qui est une
>   déduction de D1 et le contenu du § 8, pas un invariant propre.
> - D4 est le plus rentable des invariants de cette fiche et n'a aucun moyen de vérification. Le seul
>   signal identifié est faible.

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
| [**D1**](#d1-aucune-io-aucune-dépendance-injectée) | aucune I/O, aucune dépendance injectée | **forte** | règle ESLint, sans faux positif |
| [**D4**](#d4-cest-un-dernier-recours) | c'est un dernier recours | **forte** | aucun moyen — signal faible |
| [**D3**](#d3-sans-état-et-sans-effet-sur-ses-entrées) | sans état, et sans effet sur ses entrées | moyenne | règle ESLint, partielle |
| [**D2**](#d2-prend-des-objets-du-domaine-en-renvoie) | prend des objets du domaine, en renvoie | moyenne | revue |
| [**D5**](#d5-nommé-par-la-règle-pas-par-la-ressource) | nommé par la règle, pas par la ressource | hygiène | script, à mesurer |

**Écarts** — tous *à corriger*, ce qui est inhabituel et s'explique au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-le-dossier-services-mélange-deux-natures-de-fichiers) | le dossier `services/` mélange deux natures de fichiers | **à corriger** |
| [**X2**](#x2-la-règle-est-placée-dans-un-service-plutôt-que-sur-un-objet) | la règle est placée dans un service plutôt que sur un objet | **à corriger** |
| [**X3**](#x3-le-fichier-est-nommé-par-la-ressource-et-suffixé--service) | le fichier est nommé par la ressource et suffixé `-service` | **à corriger** |

L'artefact le plus cherché est le [test de discrimination](#le-test-de-discrimination) au § 1 : il
tranche en quatre questions entre objet, agrégat, usecase et service. `fiche-usecase.md` y renvoie.

---

## 1. Rôle

Un service de domaine porte une **règle métier qui ne relève d'aucun objet en particulier** — parce
qu'elle traverse plusieurs agrégats, ou parce qu'elle n'appartient naturellement à aucun d'eux.

Il prend des objets du domaine, il en renvoie. Il ne charge rien, il n'écrit rien, il ne garde aucun
état.

C'est une catégorie **de dernier recours**. Avant de l'utiliser, il faut avoir échoué à placer la
règle sur un objet-valeur, une entité ou une racine d'agrégat. Un service de domaine trop facilement
créé vide les modèles de leur logique et reconstitue un modèle anémique par la porte de service.

### Le test de discrimination

Dans cet ordre. Ce test sert aussi à `fiche-usecase.md`, qui y renvoie ; il est énoncé une fois,
parce qu'il n'appartient à aucune des deux catégories.

1. *La règle porte-t-elle sur les données d'un seul objet ?* → elle va sur cet **objet-valeur** ou
   cette **entité**.
2. *Porte-t-elle sur plusieurs objets d'une même frontière de cohérence ?* → elle va sur la **racine
   d'agrégat**.
3. *A-t-elle besoin de charger ou d'écrire quoi que ce soit ?* → c'est un **usecase**, pas un service.
4. *Reste-t-il une règle qui traverse plusieurs agrégats et se calcule sur des objets déjà fournis ?*
   → **service de domaine**.

La question 3 est celle qui tranche en pratique, et c'est la plus facile à vérifier : il suffit de
regarder si le fichier reçoit un paramètre dont le nom correspond à `/(Repository|Api|Storage)$/`.

**Le dossier ne répond pas à la question.** Un fichier de `domain/services/` qui reçoit une I/O est un
usecase, et `fiche-usecase.md` s'applique intégralement à lui. Voir X1 au § 5.

### Ce qu'un service de domaine n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un service de domaine.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| charge ou écrit des données, même une seule fois | `domain/usecases/` | `fiche-usecase.md` |
| est réutilisé par plusieurs usecases **et** fait des I/O | `domain/usecases/` — c'est un sous-usecase | `fiche-usecase.md` |
| applique une règle sur un seul objet | l'objet-valeur ou l'entité concernée | `fiche-objet-valeur.md`, `fiche-entite.md` |
| applique une règle dans une frontière de cohérence | la racine d'agrégat | `fiche-racine-agregat.md` |
| évalue un prédicat composable configuré par des données | une Specification | `fiche-specification.md` |
| met en forme pour une lecture | un read-model | `fiche-read-model.md` |
| garde un état entre deux appels | rien : un service de domaine est sans état | — |

---

## 2. Invariants

### D1. Aucune I/O, aucune dépendance injectée

**Énoncé.** C'est l'invariant qui définit la catégorie. Un service de domaine ne reçoit ni repository,
ni API interne, ni client de stockage.

```js
// conforme — tout ce dont il a besoin lui est donné, la date comprise
export function filterKnowledgeElements({
  knowledgeElements,
  createdAt,
  isImproving = false,
  minimumDelayInDaysBeforeImproving = MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
}) { … }

// fautif — reçoit un repository, donc fait des I/O : c'est un usecase
const getModuleByLink = async function ({ link, moduleMetadataRepository }) { … };
```

Le premier importe `dayjs` et une constante partagée, et c'est conforme : D1 interdit
l'infrastructure, pas les bibliothèques de calcul. Ce qui compte est que **la date de référence entre
en paramètre** — le service ne lit pas l'heure, donc son test la fixe.

L'interdiction s'étend à l'infrastructure implicite — journal, horloge, aléatoire, configuration. Une
date ou un générateur **entre en paramètre**, comme pour une entité.

**Ce qui casse.** Le service cesse d'être testable en unitaire pur : il faut une base ou une doublure.
Et il devient un usecase sans que personne l'ait décidé, dans un dossier qui promet l'inverse.

Le motif de détection est trivial : un paramètre dont le nom finit par `Repository`, `Api` ou
`Storage`. Voir § 6.

### D2. Prend des objets du domaine, en renvoie

**Énoncé.** Entrées et sorties sont des objets du domaine local, des objets-valeurs ou des scalaires.
Jamais une ligne de base, jamais le DTO d'un autre contexte, jamais un objet façonné pour une réponse
HTTP.

```js
// conforme — des objets du domaine et des scalaires, un nombre en sortie
export const getMasteryPercentage = (knowledgeElements, skillIds, round = true) => { … };
```

Un détail de ce service réel mérite d'être lu comme un signal :

```js
skillIds.some((id) => String(id) === String(knowledgeElement.skillId))
```

La double conversion en chaîne dit que **les deux identifiants n'arrivent pas dans le même type**.
Le service se protège d'entrées non normalisées, ce qui est exactement ce que D2 vise à rendre
inutile : si les entrées étaient des objets du domaine validés, la comparaison serait directe.

**Ce qui casse.** La règle devient dépendante d'une forme décidée ailleurs — un schéma de base ou le
contrat d'un voisin — donc un changement là-bas la casse.

**Corollaire souvent oublié.** Un service de domaine **ne renvoie pas de read-model**. S'il produit
une projection pour l'affichage, ce n'est pas une règle métier qu'il porte mais de la mise en forme.

### D3. Sans état, et sans effet sur ses entrées

**Énoncé.** Pas de champ, pas de mémoire entre deux appels. Un module de fonctions exportées, ou une
classe instanciée sans état. Et il ne **mute pas** ce qu'il reçoit.

```js
// conforme, malgré les apparences — les objets mutés sont ceux que le service vient de créer
function computeTubesFromSkills(skills) {
  const tubes = [];

  skills.forEach((skill) => {
    const existingTube = tubes.find((tube) => tube.name === skill.tubeNameWithoutPrefix);
    if (existingTube) {
      existingTube.addSkill(skill);                       // un tube local
    } else {
      tubes.push(new Tube({ skills: [skill], name: skill.tubeNameWithoutPrefix }));
    }
  });

  tubes.forEach((tube) => {
    tube.skills = _.sortBy(tube.skills, ['difficulty']);  // idem
  });

  return tubes;
}

// fautif — la même écriture, mais sur un objet reçu
export function sortSkills({ tube }) {
  tube.skills = _.sortBy(tube.skills, ['difficulty']);
  return tube;
}
```

L'exemple conforme est le plus utile des deux, parce qu'il ressemble à une violation : deux mutations
et une affectation de propriété. **D3 porte sur les entrées, pas sur les objets construits sur
place** — un service qui assemble sa réponse par étapes reste sans état.

**Ce qui casse.** La signature suggère une fonction pure et le comportement ne l'est pas. C'est le
défaut le plus coûteux à diagnostiquer de cette fiche : l'appelant voit un objet changer sans qu'aucune
affectation n'apparaisse chez lui.

Un service qui mute son entrée viole aussi V1 ou E6 du côté de l'objet muté, qui n'aurait pas dû
l'autoriser.

### D4. C'est un dernier recours

**Énoncé.** Avant de créer un service, avoir échoué aux trois premières questions du test de
discrimination. Le service est ce qui reste quand la règle n'a pas de propriétaire naturel.

**Pourquoi c'est un invariant et pas un conseil.** Un service de domaine est le chemin de moindre
résistance. Écrire une fonction qui prend deux objets et renvoie un booléen est toujours plus rapide
que d'ajouter une méthode sur une entité et de se demander si l'invariant tient.

**Ce qui casse.** À terme, les modèles ne contiennent plus que des champs et toute la logique vit dans
des fonctions à côté. C'est le modèle anémique, obtenu sans jamais l'avoir décidé. Voir X2 au § 5.

**Le signal à surveiller.** Un service qui prend **un seul** objet du domaine et rien d'autre. Sa règle
appartient presque toujours à cet objet.

### D5. Nommé par la règle, pas par la ressource

**Énoncé.** Le fichier porte le nom de ce qu'il calcule ou décide, pas celui d'une entité.

```
get-competence-level.js         — dit ce que ça fait
get-campaign-progression.js     — idem
scorecard-service.js            — ne dit rien, et attire tout ce qui touche à la carte de score
```

**Ce qui casse.** Un nom de ressource suffixé `-service` devient un dépotoir : il n'existe aucune
raison de refuser d'y ajouter une fonction. Un nom de règle, si — et c'est tout le mécanisme. Voir X3
au § 5.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un service reçoit `now` ou un générateur en paramètre | **autorisé**, c'est la forme correcte de D1 |
| Un service reçoit une constante de configuration en paramètre | **autorisé** — c'est une donnée, pas une dépendance |
| Un service asynchrone sans I/O, calcul long découpé | **autorisé**, mais rare — vérifier qu'aucun `await` ne porte sur une I/O |
| Un service prend plusieurs objets du domaine et renvoie un objet-valeur | **autorisé**, c'est le cas nominal. D2 |
| Un service exporté sous forme de classe sans état | **autorisé** — la forme importe moins que D3 |
| Un service partagé entre plusieurs usecases | **autorisé** si D1 tient. Le partage n'est pas le critère |
| Un service qui reçoit un repository | **pas une exception** — c'est un usecase, quel que soit son dossier |
| Un service qui prend un seul objet du domaine | **pas une exception**, mais un signal : la règle appartient probablement à cet objet. D4 |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **D1** aucune I/O | **forte** | Une règle métier testable en unitaire pur, sans base ni doublure — alors que la même règle dans un usecase demande des fixtures |
| **D4** dernier recours | **forte** | Le gain est **en creux** : forcer la question « cette règle ne pourrait-elle pas vivre sur un objet ? » avant de créer le fichier. C'est ce qui empêche les modèles de se vider |
| **D3** sans état, sans effet de bord | moyenne | Rejouable et parallélisable, et l'appelant n'a pas de surprise sur les objets qu'il a passés |
| **D2** objets du domaine en entrée et en sortie | moyenne | La règle est réutilisable depuis n'importe quel contexte d'appel — route, script, job — sans adaptation |
| **D5** nommé par la règle | hygiène | La liste des fichiers dit quelles règles transversales existent dans le contexte |

D1 et D4 sont tous deux en rentabilité forte, et leur vérifiabilité est opposée : D1 se lit dans la
signature sans faux positif, D4 n'a aucun moyen. C'est la tension propre à cette fiche.

### Ce que ça n'apporte pas

Ces invariants ne disent pas si la règle **devait** être transversale. Un service de domaine
irréprochable peut être le symptôme d'une frontière d'agrégat mal placée : la règle traverse deux
agrégats parce qu'ils auraient dû n'en faire qu'un. Voir A1 de `fiche-racine-agregat.md`.

---

## 5. Écarts avec la théorie

Les écarts sont numérotés `X` et non `D`, qui est le préfixe des invariants de cette fiche.

**Les trois sont des dérives, et aucun n'est une convention assumée.** La raison est historique : le
sens du dossier n'avait jamais été décidé, donc il n'y avait pas de convention à assumer. Il l'est
depuis le 2026-09-08 — `services/` est réservé aux vrais services — ce qui donne à `X1` une direction
au lieu d'un arbitrage.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le dossier `services/` mélange deux natures de fichiers | dérive | Tant que le mélange dure, `D1` reste inactivable et le mot induit en erreur qui vient du DDD | Nul | **À corriger** — direction décidée |
| **X2** La règle est placée dans un service plutôt que sur un objet | dérive | Les modèles se vident de leur logique, et la règle est plus loin de sa donnée | L'écriture est plus rapide, et l'invariant de l'objet n'a pas à être réexaminé | **À corriger** |
| **X3** Le fichier est nommé par la ressource et suffixé `-service` | dérive | Le fichier attire tout ce qui touche à la ressource, sans critère pour refuser | Nul | **À corriger** |

### X1. Le dossier `services/` mélange deux natures de fichiers

**Ce que dit la théorie.** Chez Evans, un Service est sans état et son interface est formulée dans les
termes du modèle. Il ne fait pas d'I/O — sinon c'est de l'orchestration, ce que Clean Architecture
appelle un usecase.

**Exemple concret.** Deux fichiers du même dossier, deux natures :

```
domain/services/
  get-mastery-percentage-service.js   → prend des objets, calcule, renvoie : vrai service
  module-service.js                   → reçoit un repository, charge, lève : usecase
  index.js                            → un fichier de câblage : il importe les repositories
                                        de trois contextes et appelle injectDependencies
```

Le dossier ne distingue pas ces natures, donc un relecteur ne sait pas quel jeu d'invariants
appliquer, et la règle de D1 ne peut pas être activée en erreur. Le troisième cas est l'exception
nommée, symétrique de celle de `domain/usecases/index.js` — voir X5 de `fiche-repository.md`.

**Correction, et la direction est décidée.** `domain/services/` est réservé aux **vrais services de
domaine**. Les fichiers qui reçoivent une I/O partent dans `usecases/`.

C'est la position la plus fidèle aux sources, et à deux titres. Chez Evans, un Service est sans état et
ne fait pas d'I/O. Et `docs/fr/Anatomy.md` décrit `domain/services` comme les « Services métier du
domaine » — le nom dit le métier, pas le partage entre usecases.

Elle a deux conséquences à assumer.

`D1` devient **activable en erreur** une fois le déplacement fait. C'est le bénéfice, et il est
immédiat : plus personne ne peut ajouter un repository à un fichier de ce dossier.

Et le dossier devient **rare, voire vide dans certains contextes**. C'est normal, pas un signe que la
décision était mauvaise : une règle qui traverse plusieurs agrégats sans rien charger est une chose
peu fréquente.

Deux positions avaient été écartées : acter que `services/` désigne un sous-usecase partagé, ce qui
aurait obligé à renoncer à `D1` ; et renommer le dossier en `shared-usecases/`, moins cher mais qui
laissait le vrai service sans domicile.

Le préalable au déplacement est le classement des fichiers existants, par le test du § 1. La règle du
§ 6, en avertissement, produit la liste.

### X2. La règle est placée dans un service plutôt que sur un objet

**Ce que dit la théorie.** Evans insiste sur le fait qu'un Service ne doit pas dépouiller les objets de
leur comportement. Fowler nomme le résultat obtenu quand on l'ignore : le modèle anémique.

**Exemple concret.**

```js
// dans domain/services/ — la règle porte sur un seul objet
function computeTubesFromSkills(skills) { … }
```

Le signal est celui de D4 : une seule collection d'objets du domaine en entrée, et un objet du domaine
en sortie. Grouper des acquis par tube est une règle du modèle d'apprentissage, pas un calcul
transverse.

**Correction.** Déplacer la règle sur l'objet, sous une fabrique nommée — `Tube.groupFromSkills(skills)`.
Les appelants passent de la fonction à la méthode statique.

Ce qui rend la correction non mécanique : décider si la règle appartient à l'objet demande de savoir
si elle contraint son état ou si elle relie deux objets. Le signal de D4 désigne où regarder, il ne
tranche pas.

Cet écart est proche de celui vu depuis le usecase — X1 de `fiche-usecase.md` — mais le fichier fautif
et la correction diffèrent : là-bas la règle est dans l'orchestration, ici elle est dans une fonction
transverse qui avait l'air d'un bon endroit.

### X3. Le fichier est nommé par la ressource et suffixé `-service`

**Ce que dit la théorie.** L'interface d'un Service est formulée dans les termes du modèle, et sa
définition dit ce qu'il fait. Un nom de ressource ne dit rien.

**Exemple concret.**

```
domain/services/scorecard-service.js
  → computeScorecard, computeLevelUpInformation, resetScorecard,
    _computeResetSkillsNotIncludedInCampaign, …
```

Deux détails de cette liste réelle disent tout : `resetScorecard` **écrit**, donc le fichier héberge
déjà un usecase ; et `_computeResetSkillsNotIncludedInCampaign` est exporté avec un tiret bas, donc
même son auteur savait qu'il n'aurait pas dû sortir.

Le fichier n'a aucun critère pour refuser une fonction de plus, et il grossit jusqu'à devenir la
seule chose que personne n'ose ouvrir.

**Correction.** Un fichier par règle, nommé par la règle. Le découpage est mécanique quand les
fonctions sont indépendantes ; il ne l'est pas quand elles partagent des fonctions privées, auquel cas
il faut décider où celles-ci vont.

C'est l'écart le moins coûteux à corriger des trois, et le seul dont la correction ne demande aucune
décision de conception quand les fonctions sont indépendantes.

---

## 6. Vérification déterministe

L'invariant définissant de cette fiche se lit dans la signature, ce qui rend le § 6 plus court et plus
concluant que dans les autres fiches du domaine.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **D1** aucune I/O — signature | règle ESLint : paramètre en `/(Repository\|Api\|Storage)$/` dans `domain/services/` | ~20 lignes | aucun |
| **D1** aucune I/O — imports | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **D3** sans état | règle ESLint : champ de classe dans un fichier de `domain/services/` | ~15 lignes | faibles |
| **§ 8** un test unitaire existe | script `tests/tooling/` | ~30 lignes | aucun |
| **D5** nommé par la règle | script : nom de fichier terminant par `-service` | ~15 lignes | **à mesurer** |
| **D2**, **D4** | revue | — | — |

### D1 — la règle qui force la décision

```
Dans un fichier de domain/services/, un paramètre déstructuré dont le nom
correspond à /(Repository|Api|Storage)$/.
```

Vingt lignes, aucun faux positif, et décidable sans quitter la signature.

**Elle sortira sur l'existant, et c'est son intérêt** : elle transforme une ambiguïté de vocabulaire en
décision datée. À introduire en **avertissement** le temps de trancher X1, puis en erreur si c'est la
première position qui est retenue.

Le même parcours d'AST sert le discriminant du § 6 de `fiche-usecase.md` et I1 étape 1 de
`fiche-repository.md`, qui repère déjà les paramètres en `/Api$/`. Coût marginal.

La règle `dependency-cruiser` la complète pour les imports directs :

```js
{
  name: 'domain-service-must-not-do-io',
  severity: 'error',
  from: { path: 'src/.+/domain/services/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Écrire `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et la règle ne se déclenche jamais, sans le signaler.

### L'existence du test unitaire comme indicateur

Un fichier de `domain/services/` sans test unitaire associé est soit non testé, soit testé en
intégration — auquel cas D1 est probablement violé. Le script ne prouve rien, il désigne où regarder.

La correspondance se fait sur le **nom de base**, après retrait du suffixe de test : le fichier peut
vivre dans un sous-dossier alors que son test est à plat, et le suffixe n'est pas le même partout.

### Ce qui n'est pas mécanisable

D4 est le plus important et le moins vérifiable : savoir si une règle aurait pu vivre sur un objet
demande de connaître cet objet.

Le seul proxy identifié est le signal « un seul objet du domaine en entrée », qui mérite une revue et
non un verdict. Il ne couvre pas le cas le plus fréquent — une règle sur deux objets qui appartenait à
l'un des deux.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **D1 imports** — configuration `dependency-cruiser`, avec contre-épreuve
2. **D1 signature** — en avertissement, pour produire la liste des fichiers à classer
3. **X1** — trancher les trois positions, puis classer
4. **D1 signature en `error`** — si la première position est retenue
5. **D3** — règle sur les champs de classe
6. **§ 8 + D5** — un seul script, une fois le dossier stabilisé

Les points 2 et 3 sont l'essentiel du travail, et le second n'est pas de l'outillage.

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X1** déplacement | oui, une fois la décision prise | Déplacer un fichier de `services/` vers `usecases/` et réécrire ses imports. Cas d'arrêt : si le fichier a un câblage dédié, le signaler plutôt que deviner |
| **X3** découpage | partiel | Séparer des fonctions indépendantes en fichiers nommés, oui. Décider où vont les fonctions privées partagées, non |
| **D5** renommage | oui, complet | Renommer et réécrire les imports |
| **X2** déplacement de règle | non | Déplacer une règle vers le bon objet est de la conception |

---

## 7. Le type

Un service de domaine est un **module de fonctions**, et son typage n'a rien de particulier : des
paramètres nommés, des objets du domaine en entrée et en sortie.

```ts
export function filterKnowledgeElements(params: {
  knowledgeElements: readonly KnowledgeElement[];
  createdAt: Date;
  isImproving?: boolean;
  minimumDelayInDaysBeforeImproving?: number;
}): readonly KnowledgeElement[] { … }
```

Ce que le typage apporte ici, et c'est plus que dans les autres fiches du domaine : **D1 devient
partiellement structurel**. Un paramètre typé `ModuleMetadataRepository` est visible dans la signature, donc la
violation se lit sans exécuter le fichier. Combiné à la règle du § 6, il ne reste rien à deviner.

Ce que le typage n'apporte pas : D3 et D4. L'absence d'effet de bord n'est pas exprimable — `readonly`
empêche l'écriture au typage mais est effacé à la compilation, et il ne dit rien des méthodes
mutantes de l'objet reçu. Et rien ne dit qu'une règle aurait pu vivre ailleurs.

La forme retenue est le module de fonctions, pas la classe. Une classe sans état n'apporte rien qu'un
module n'apporte, et elle laisse la porte ouverte à un champ.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Service de domaine | **unitaire pur** — aucune base, aucune doublure | la règle, sur le cas nominal **et** les cas limites |
| Absence d'effet sur les entrées | **unitaire** | que les objets passés ne sont pas modifiés |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6.

Deux indices de diagnostic, avec leurs bornes.

**Un service qui a besoin d'une doublure viole D1.** La doublure nécessaire n'est pas une contrainte
du test, c'est le diagnostic. Cet indice est sans borne : il n'existe aucun cas où un vrai service de
domaine en demande une.

**Le second test de la table est celui qui manque le plus souvent**, et c'est le seul qui prouve D3.
La borne : un service qui ne reçoit que des scalaires n'a rien à ne pas muter.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce que la règle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [auto]    D1  Aucun paramètre en *Repository, *Api, *Storage ; aucun import d'infrastructure
[ ] [humain]  D1  Ni horloge, ni aléatoire, ni configuration lue directement — tout entre en paramètre
[ ] [humain]  D4  La règle ne pouvait pas vivre sur un objet-valeur, une entité ou une racine
[ ] [partiel] D3  Aucun état ; les objets reçus ne sont pas modifiés
[ ] [humain]  D2  Entrées et sorties sont des objets du domaine local ou des scalaires
[ ] [partiel] D5  Le fichier est nommé par la règle, pas par une ressource suffixée -service
[ ] [auto]    Un fichier de test unitaire existe, et son nom correspond à celui du service
[ ] [humain]  Test unitaire pur, sans doublure, avec les cas limites
[ ] [humain]  Un test prouve que les entrées ne sont pas mutées
[ ] [humain]  Si le service prend un seul objet du domaine, vérifier que la règle ne lui appartient pas
```

À terme il reste sept lignes, toutes de jugement. La ligne la plus rentable de la liste — D4 — est
aussi celle qu'aucun outil ne couvrira, et c'est structurel : elle porte sur une alternative qui
n'existe pas dans le code.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La catégorie, et **D1**, **D2**, **D3** | Evans, *DDD*, ch. « A Model Expressed in Software » — le Service y est défini **sans état**, et son interface est formulée dans les termes du modèle | *DDD Reference*, PDF gratuit |
| **D4** dernier recours | Evans, même ch. — il insiste sur le fait qu'un Service ne doit pas dépouiller les objets de leur comportement. Fowler, « AnemicDomainModel » pour le symptôme obtenu quand on l'ignore | bliki gratuit |
| **D5** nommé par la règle | **aucune source** — convention proposée par cette fiche | — |
| La distinction service / usecase | Martin, *Clean Architecture*, ch. « Business Rules » — les règles d'entreprise sont indépendantes de l'application, les usecases orchestrent | le livre de 2017 |
| Le sens du dossier `services/` (X1) | **aucun ADR.** L'ADR 51 fixe l'arborescence sans définir ce que contient `services/`, et l'ADR 20 rend le usecase obligatoire sans traiter le cas du service. `docs/fr/Anatomy.md` le décrit comme les « Services métier du domaine », ce qui appuie la décision sans en tenir lieu | ADR 20 et 51 ; `docs/fr/Anatomy.md` |

**Un invariant sur cinq n'a aucune source** : D5, la convention de nommage. L'essentiel — D1, D2, D3 —
vient directement de la définition d'Evans, et c'est ce qui rend la fiche opposable : ce n'est pas une
préférence locale, c'est la définition du mot qu'on emploie.

Ce qui n'a **aucune source Pix**, en revanche, c'est le sens donné au dossier. C'est ce que X1 sert à
ouvrir.
