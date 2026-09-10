# Fiche — Racine d'agrégat

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - Appliquée telle quelle, cette fiche disqualifie du code existant : peu d'objets satisfont A1 et
>   A2. Elle sert d'abord à trancher un débat de conception, ensuite à contrôler du code.
> - `A7` est l'invariant de la littérature, et **Pix a décidé autrement** pour les écritures qui
>   doivent échouer ensemble — ADR 25, sur un motif mesuré. Le lire avec `X4` au § 5, sans quoi la
>   fiche paraît prescrire ce que le dépôt contredit.
> - Les numéros **A4** et **A5** ne sont pas attribués. Ils portaient des invariants identiques à E7
>   et E3 de `fiche-entite.md`, avec des ROI inversés. Les énoncés vivent désormais là-bas, et les
>   numéros ne sont pas réattribués.
> - X2 — aucune racine n'est déclarée — bloque le calcul de l'indicateur de A3 et la revue de A1. À
>   traiter avant le reste.

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
| [**A1**](#a1-la-frontière-de-cohérence-est-explicite) | la frontière de cohérence est explicite | **forte** | revue, après X2 |
| [**A2**](#a2-la-racine-est-le-seul-point-dentrée) | la racine est le seul point d'entrée | **forte** | règle ESLint |
| [**A6**](#a6-petit-agrégat) | petit agrégat | moyenne | revue |
| [**A7**](#a7-une-transaction-un-agrégat) | une transaction, un agrégat | moyenne | revue |
| [**A3**](#a3-un-repository-par-racine-et-seulement-pour-les-racines) | un repository par racine | hygiène | indicateur, après X2 |

[**Invariants hérités de l'entité**](#les-invariants-hérités-de-lentité) — toute racine est une
entité, donc E1 à E8 de `fiche-entite.md` s'appliquent intégralement. Deux y jouent un rôle
particulier : `E3` les invariants tenus à tout instant, et `E7` la référence par identité.

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-le-mot-agrégat-est-posé-sur-des-dossiers-sans-frontière-nommable) | le mot « agrégat » est posé sur des dossiers sans frontière nommable | **à corriger** |
| [**X2**](#x2-aucune-racine-nest-déclarée-nulle-part) | aucune racine n'est déclarée nulle part | **à corriger** |
| [**X3**](#x3-plusieurs-repositories-pour-une-même-frontière) | plusieurs repositories pour une même frontière | à surveiller |
| [**X4**](#x4-une-opération-modifie-plusieurs-agrégats-dans-la-même-transaction) | une opération modifie plusieurs agrégats dans la même transaction | rien à faire |

L'artefact le plus cherché est le [test de discrimination](#le-test-de-discrimination) au § 1 : il
dit en trois questions s'il y a un agrégat ou non.

---

## 1. Rôle

Un agrégat est un **groupe d'objets traité comme une unité de cohérence**. Sa racine est l'entité par
laquelle on y accède : rien de ce qu'il contient n'est atteignable autrement.

Sa raison d'être tient en une phrase : **il existe une règle qui porte sur plusieurs objets à la fois,
et quelqu'un doit garantir qu'elle est vraie en permanence.** C'est la racine.

S'il n'y a pas de telle règle, il n'y a pas d'agrégat — juste une entité et des objets à côté. Poser
le mot sur un dossier sans cette règle promet une garantie qui n'existe pas, ce qui coûte plus cher
que de ne pas ranger du tout. Voir X1 au § 5.

### Le test de discrimination

Dans cet ordre :

1. *Existe-t-il une règle qui porte sur plusieurs de ces objets simultanément ?* Si non, ce n'est pas
   un agrégat.
2. *Cette règle doit-elle être vraie en permanence, ou peut-elle se réconcilier plus tard ?* Si elle
   peut attendre, la frontière est ailleurs.
3. *Y a-t-il un objet par lequel tout accès doit passer ?* C'est la racine.

Contre-exemple courant, qui échoue à la première question : « ces objets sont toujours affichés
ensemble » n'est pas une règle de cohérence, c'est un besoin de lecture. Il appelle un read-model.

### Racine d'agrégat ou entité

Toute racine d'agrégat est une entité, et `fiche-entite.md` s'applique intégralement. Cette fiche
ajoute ce qui est propre à la racine : la frontière, le point d'entrée unique, le repository.

Une entité qui vit **à l'intérieur** d'un agrégat n'est pas une racine : elle n'a ni repository, ni
accès direct.

### Ce qu'une racine d'agrégat n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas une racine d'agrégat.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| n'a pas de règle commune à plusieurs objets à tenir en permanence | une entité, dans `domain/models/` | `fiche-entite.md` |
| regroupe des objets pour une lecture, sans règle commune | un read-model, dans `domain/read-models/` | `fiche-read-model.md` |
| n'a pas d'identité | un objet-valeur | `fiche-objet-valeur.md` |
| est construit par une suite de mutateurs appelés de l'extérieur | un constructeur dédié, ou un read-model | `fiche-read-model.md` |
| coordonne plusieurs agrégats | `domain/usecases/` | `fiche-usecase.md` |
| applique une règle qui ne relève d'aucun agrégat, sans I/O | `domain/services/` | `fiche-service-domaine.md` |
| compose des règles évaluables et pilotées par des données | une Specification | `fiche-specification.md` |

---

## 2. Invariants

### Les invariants hérités de l'entité

Toute racine est une entité. **E1 à E8 de `fiche-entite.md` s'appliquent intégralement** et ne sont
pas répétés ici. Deux y jouent un rôle particulier pour une racine.

**E3 — les invariants sont tenus à tout instant.** Pour une entité simple, l'invariant porte sur ses
propres champs. Pour une racine, il porte sur la **frontière entière** : après chaque opération, y
compris celle qui échoue à mi-chemin, tout ce que contient l'agrégat est cohérent. C'est la
formulation forte de A1.

**E7 — les autres agrégats sont référencés par identité.** Pour une entité simple, c'est une bonne
pratique qui borne le coût d'un chargement. Pour une racine, c'est **constitutif** : c'est ce qui
définit où s'arrête la frontière. Une racine qui tient l'instance d'une autre racine n'a pas de
frontière, elle en a deux confondues.

Le corollaire à ne pas oublier : à l'intérieur d'un même agrégat, tenir les instances est normal.
C'est la définition d'un agrégat, et c'est l'exception que E7 nomme.

### A1. La frontière de cohérence est explicite

**Énoncé.** L'agrégat existe parce qu'une règle porte sur plusieurs de ses objets à la fois. Cette
règle doit être **nommable**.

Le test : formuler la phrase « à tout instant, dans cet agrégat, … doit être vrai ». Si la phrase ne
vient pas, il n'y a pas de frontière à protéger.

```
// nommable — il y a un agrégat, et le code le vérifie
« à tout instant, toute participation portée par un parcours combiné est
  une participation de ce contexte, et non une forme quelconque »

    participations: Joi.array().items(Joi.object().instance(CombinedCourseParticipation))

// non nommable — il n'y en a pas
« ces objets sont toujours chargés ensemble »
```

Le premier énoncé est **mince** : il contraint un type, pas une quantité métier. Un invariant mince
reste un invariant, mais c'est un signal — si c'est tout ce que la frontière garantit, la question de
A6 se pose aussitôt : porter cette collection vaut-il son chargement ?

Le second n'est pas un invariant mais une observation sur les habitudes de chargement. C'est le seul
énoncé disponible pour un objet assemblé pour un écran, et c'est exactement pourquoi ces objets ne
sont pas des agrégats.

**Ce qui casse.** Sans frontière nommable, chaque écriture portant sur plusieurs objets est une
décision improvisée : personne ne sait ce qu'une transaction doit couvrir, ni ce qui peut se
réconcilier plus tard.

**Prérequis de vérification.** Cet invariant n'est contrôlable que si la phrase est écrite quelque
part. Elle ne l'est nulle part aujourd'hui — c'est X2 au § 5.

### A2. La racine est le seul point d'entrée

**Énoncé.** Rien de ce que contient l'agrégat n'est atteignable sans passer par la racine. Ni par
import direct, ni par un repository dédié, ni par un accesseur qui rend la référence interne
modifiable.

```js
// fautif — le champ est public : l'appelant obtient la collection interne,
// peut la modifier, et peut même la remplacer entièrement
class CombinedCourse {
  constructor({ participations = [] } = {}) {
    this.participations = participations;
  }
}

// conforme — la racine ne rend que des résultats, jamais la collection
get participationsCount() {
  return this.#participations.length;
}
get completedParticipationsCount() {
  return this.#participations.filter((participation) => participation.isCompleted()).length;
}
```

Les deux formes coexistent dans le même fichier réel : le champ est public, **et** la racine expose
déjà deux comptages dérivés. C'est la moitié du travail faite. Passer `#participations` en privé
suffit, puisque les accesseurs qui remplacent la collection existent déjà.

Ces deux comptages sont d'ailleurs la forme qu'Evans autorise explicitement pour traverser la
frontière : un scalaire calculé, pas la collection — voir le § 10.

**Ce qui casse.** La règle de frontière devient contournable, donc ce n'est plus une garantie mais une
convention. C'est la différence que porte tout l'intérêt de la catégorie.

**Conséquence sur les objets internes.** Ils n'ont pas de repository, et leur identité n'a de sens que
dans l'agrégat. S'ils ont besoin d'être retrouvés indépendamment, ils ne sont pas internes.

### A3. Un repository par racine, et seulement pour les racines

**Énoncé.** Le nombre de repositories d'un contexte dit combien d'unités de cohérence il a.

C'est l'invariant le plus souvent abandonné en pratique, parce que le découpage réel suit les besoins
de requêtage. **Deux positions sont cohérentes, une troisième ne l'est pas :**

- tenir A3, et accepter que certaines lectures passent par un read-model plutôt que par un repository
  dédié ;
- renoncer à A3 assumément, et **renoncer aussi au mot « agrégat »** — parler d'entités et de
  repositories ;
- garder le mot et multiplier les repositories : le vocabulaire ne veut plus rien dire.

**Ce qui casse.** Compter les repositories cesse d'être une information. C'est un invariant d'hygiène :
il ne prévient aucun défaut, il préserve la valeur d'un indicateur. Voir X3 au § 5, et X4 de
`fiche-repository.md` qui traite le même écart depuis l'autre bord.

### A6. Petit agrégat

**Énoncé.** Préférer plusieurs petits agrégats reliés par identité à un gros agrégat qui tient tout.

Un agrégat grossit naturellement, parce qu'il est commode d'y ajouter ce qu'on a sous la main. Deux
questions à poser à chaque ajout :

- *cette donnée doit-elle être cohérente avec le reste à tout instant, ou seulement à terme ?*
- *combien de lignes cet ajout fait-il charger pour une opération qui ne s'en sert pas ?*

**Ce qui casse.** Un gros agrégat se charge entier pour chaque opération, y compris celles qui ne
touchent qu'un champ. Et il concentre les écritures concurrentes, donc la contention.

C'est aussi la réponse de la littérature au coût de chargement : réduire l'agrégat plutôt que le
charger partiellement. Le modèle partiellement rempli est écarté pour la raison exposée dans X4 de
`fiche-repository.md`.

### A7. Une transaction, un agrégat

**Énoncé.** Une opération modifie **un** agrégat. Si elle doit en modifier deux, deux voies :

- la frontière est mal placée, et les deux n'en font qu'un ;
- ou ils sont bien distincts, et la cohérence entre eux se règle **à terme** — un événement, un job,
  une réconciliation.

**Ce qui casse.** Une transaction qui couvre plusieurs agrégats verrouille plus de lignes que
nécessaire, et fait échouer des opérations sans rapport entre elles. Et elle masque une frontière mal
placée : personne ne se pose la question tant que la transaction absorbe le problème.

**La position Pix est différente, et elle est décidée.** L'ADR 25 retient explicitement la transaction
qui couvre plusieurs agrégats quand les écritures doivent échouer ou réussir ensemble, et prescrit de
les orchestrer dans le usecase **sans événements**. Son motif est mesuré : des deadlocks constatés en
production, causés par des événements à l'intérieur de transactions.

`A7` reste donc l'invariant de la littérature, et il garde sa valeur comme **question de conception** —
si deux agrégats doivent toujours changer ensemble, la frontière est peut-être mal placée. Mais ce
n'est pas la règle appliquée. Voir `X4` au § 5, qui instruit l'écart.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un agrégat réduit à sa seule racine, sans objet interne | **autorisé** et fréquent — l'invariant porte alors sur les seuls champs de la racine |
| Une racine expose une collection en lecture par copie | **autorisé**, c'est la forme correcte de A2 |
| Une lecture qui traverse plusieurs agrégats | **autorisé** via un read-model — A3 ne contraint que l'écriture |
| Une opération qui touche deux agrégats via un événement ou un job | **autorisé**, c'est la seconde voie de A7 |
| Un identifiant d'un autre contexte porté comme donnée | **autorisé**, c'est E7 bien appliqué |
| La racine tient les instances de ses objets internes | **autorisé**, c'est la définition d'un agrégat |
| Plusieurs repositories pour une même frontière | **pas une exception** — c'est X3, une convention à trancher explicitement |
| Un dossier `aggregates/` contenant des read-models | **pas une exception** — c'est X1 |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **A1** frontière explicite | **forte** | On sait ce qui doit être vrai ensemble, donc ce qu'une transaction doit couvrir. Sans cette réponse, chaque écriture multiple est improvisée |
| **A2** point d'entrée unique | **forte** | La règle ne peut pas être contournée. C'est la différence entre une garantie et une convention |
| **A6** petit agrégat | moyenne | Moins de contention en écriture, chargements plus rapides, frontières plus faciles à déplacer quand le métier change |
| **A7** une transaction, un agrégat | moyenne | Les conflits d'écriture concurrente restent raisonnables, et la question « faut-il une transaction ici ? » a une réponse mécanique |
| **A3** un repository par racine | hygiène | Le nombre de repositories redevient une information sur la conception. Aucun défaut prévenu |

Les invariants hérités gardent le ROI qu'ils ont dans `fiche-entite.md`. **E3** et **E7** y sont
classés en rentabilité forte, et c'est sur une racine que ce classement se justifie le plus.

### L'avertissement propre à cette fiche

Ces rentabilités sont **potentielles, pas acquises** : elles supposent une frontière correctement
placée. Un agrégat qui respecte tous les invariants sur une mauvaise frontière n'a aucun ROI — il sera
seulement plus difficile à corriger, parce que le code s'y sera appuyé.

C'est la seule fiche du corpus où respecter les invariants peut aggraver le problème. La conséquence
pratique : trancher A1 avant d'outiller quoi que ce soit.

### Ce que ça n'apporte pas

Ces invariants ne disent pas **où** placer la frontière. Ils disent ce qu'il faut tenir une fois
qu'elle est posée. Le placement est un travail de modélisation avec le métier, pas une déduction
depuis le code.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le mot « agrégat » est posé sur des dossiers sans frontière nommable | dérive | Le dossier promet une garantie qui n'existe pas. On y cherche des invariants absents, et leur absence passe pour normale | Un rangement, quel qu'il soit | **À corriger** |
| **X2** Aucune racine n'est déclarée nulle part | dérive | A1 n'est vérifiable ni par un humain ni par un outil, et l'indicateur de A3 est incalculable | Nul | **À corriger** |
| **X3** Plusieurs repositories pour une même frontière | convention assumée | A3 tombe, donc compter les repositories ne dit plus rien de la conception | Réel — chaque requête est écrite pour son besoin, sans champ chargé pour rien | *À surveiller* |
| **X4** Une opération modifie plusieurs agrégats dans la même transaction | convention assumée | Une transaction verrouille plus que nécessaire, et masque une frontière mal placée | Réel et **mesuré** — l'alternative par événements a causé des deadlocks en production, et la cohérence immédiate évite tout appareil de compensation | *Rien à faire* |

### X1. Le mot « agrégat » est posé sur des dossiers sans frontière nommable

**Ce que dit la théorie.** Un agrégat existe s'il y a une règle portant sur plusieurs objets à tenir
en permanence. Sans cette règle, il n'y a pas d'agrégat.

**Exemple concret.** Un dossier qui annonce une frontière de cohérence et contient des projections de
lecture :

```
domain/models/<un-domaine>/
  aggregates/
    …Details.js                  → assemblé pour un écran : aucune règle commune
    …ParticipationDetails.js     → idem
    DataFor….js                  → le candidat d'une Specification : un objet-valeur
```

Le mot annonce des invariants tenus. Un relecteur qui ne les trouve pas conclut que la fiche est mal
appliquée, alors que ces objets n'avaient rien à faire là.

**Correction.** Appliquer le test du § 1, fichier par fichier, et renommer le dossier selon le
résultat.

1. Aucune règle commune, assemblé pour une lecture → c'est un **read-model**, il va dans
   `domain/read-models/`. `fiche-read-model.md` s'applique.
2. Une règle commune nommable → c'est un agrégat, le dossier garde son nom, et la phrase de A1
   s'écrit — c'est X2.
3. Une seule entité et des objets à côté, sans règle commune → le dossier n'a pas à s'appeler
   `aggregates/`.

Le renommage coûte peu et retire une promesse non tenue. C'est le seul des quatre écarts dont la
correction ne demande pas de décision de modélisation.

### X2. Aucune racine n'est déclarée nulle part

**Ce que dit la théorie.** Rien, directement : la théorie ne prescrit pas de fichier. L'écart est
avec la vérifiabilité, pas avec le livre.

**Exemple concret.** A1 demande qu'une phrase soit nommable. A3 demande de comparer le nombre de
repositories au nombre de racines. Ni l'une ni l'autre information n'existe sous une forme lisible :
il faut ouvrir chaque modèle et deviner.

**Correction.** Déclarer les racines par contexte, avec leur invariant de frontière. Un fichier de
quelques lignes suffit :

```md
## Racines d'agrégat de ce contexte

- **CombinedCourse** — à tout instant, toute participation portée est une participation
  de ce contexte
- **CombinedCourseBlueprint** — _invariant de frontière non formulé_
```

La deuxième ligne est le vrai apport du fichier : une racine dont personne n'a écrit ce qu'elle
garantit se voit immédiatement, alors qu'aujourd'hui il faut ouvrir le modèle et deviner.

Ce que ça débloque, et c'est disproportionné au coût : A1 devient revuable, l'indicateur de A3
devient calculable, et A6 a un point de comparaison. C'est le premier travail à faire sur cette
fiche.

**Le vrai levier de cette fiche n'est pas l'outillage, c'est la déclaration.** Tant qu'aucun fichier
ne dit « voici les racines de ce contexte et ce que chacune garantit », aucune analyse statique ne
peut le déduire.

### X3. Plusieurs repositories pour une même frontière

**Ce que dit la théorie.** Le Repository porte sur les agrégats, pas sur les entités internes ni sur
les besoins de requête. Un repository par racine.

**Exemple concret.** Trois repositories pour une seule frontière de cohérence :

```
infrastructure/repositories/
  combined-courses/
    combined-course-repository.js               getById, save
  combined-course-details-repository.js         getById, avec tout ce qu'un écran affiche
  combined-course-participations/
    combined-course-participation-repository.js une entité interne à la frontière
    organization-learner-participation-repository.js
  prescription/
    combined-course-participant-repository.js   la même frontière, vue d'un autre besoin
```

Cinq fichiers, une frontière de cohérence. Le rangement en sous-dossiers, par besoin appelant, dit
bien ce qu'il est : un découpage par requête, pas par agrégat.

**Correction.** Aucune sur le découpage : le bénéfice est réel, et c'est instruit en détail dans X4 de
`fiche-repository.md`, qui tranche l'alternative — le modèle partiellement rempli est à écarter, la
réponse est de réduire l'agrégat.

Deux points à tenir, qui sont le prix de la convention :

1. Ne pas poser le mot « agrégat » sur un dossier si les repositories ne suivent pas ce grain. C'est
   X1.
2. Les repositories créés pour un besoin de lecture renvoient des **read-models**, pas des racines
   partiellement chargées. C'est la frontière à ne pas franchir.

### X4. Une opération modifie plusieurs agrégats dans la même transaction

**Ce que dit la théorie.** Vernon, règle 4 : la cohérence hors de la frontière se règle à terme. Une
transaction couvre un agrégat.

**Exemple concret.** Un usecase transactionnel qui écrit dans deux frontières distinctes :

```js
export const updateUserPassword = withTransaction(async function ({ … }) {
  const user = await userRepository.getByEmail(email);
  …
  await authenticationMethodRepository.updatePassword({ userId, hashedPassword });
  await userRepository.updateEmailConfirmed(userId);   // autre agrégat
});
```

L'exemple est le meilleur argument de la décision : `User` et `AuthenticationMethod` sont deux
agrégats, et un mot de passe changé sans courriel confirmé — ou l'inverse — laisse un compte dans un
état dont personne ne veut. **Ces deux écritures doivent échouer ensemble.** La cohérence à terme n'y
répondrait pas ; elle laisserait une fenêtre pendant laquelle le compte est cassé.

**Correction.** Aucune, et ce n'est pas une tolérance : c'est une décision, portée par l'**ADR 25**.

Son raisonnement mérite d'être connu, parce qu'il est l'inverse de l'intuition. Pix avait la
chorégraphie par événements à l'intérieur des transactions — la forme même qui aurait permis de
découper. Elle a causé des **deadlocks en production**, en épuisant le pool de connexions. L'ADR 25 en
tire deux règles : plus d'événements dans une transaction, et les écritures qui doivent échouer
ensemble sont orchestrées dans le usecase, transaction comprise, même si elles couvrent plusieurs
agrégats.

C'est donc un bénéfice **mesuré**, ce qui est rare dans ce corpus et ce qui suffit à classer l'écart en
*rien à faire*. La grille du gabarit est explicite : une mesure change le verdict, une intuition non —
ici la mesure existe, et elle va contre la littérature.

Ce qui est à tenir : quand le cas se présente sur du code neuf, poser la question de `A7` plutôt que
d'élargir la transaction par réflexe. Une transaction qui grossit reste un signal possible de
frontière mal placée, et c'est le seul moment où on la voit.

Ce qui rouvrirait le dossier : de la contention mesurée sur une de ces transactions, c'est-à-dire le
même type de preuve que celle qui a produit l'ADR 25.

---

## 6. Vérification déterministe

Cette section est courte, et c'est le résultat honnête : presque tout ici demande de savoir ce qui
appartient à la même frontière, information qui n'est écrite nulle part. C'est X2.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure. Ce point est daté, à retirer dès que l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **A2** point d'entrée unique | règle ESLint : accesseur rendant un champ privé de type tableau | ~30 lignes | faibles |
| **A3** un repository par racine | script `tests/tooling/` : rapport du nombre de repositories au nombre de racines déclarées | ~30 lignes | c'est un **indicateur**, pas une règle. Incalculable avant X2 |
| **A1** frontière explicite | revue, sur la phrase déclarée | — | impossible avant X2 |
| **A6**, **A7** | revue | — | — |
| Invariants hérités | voir § 6 de `fiche-entite.md` | — | — |

### A2 — la seule règle nette

Un accesseur qui rend directement une collection interne casse le point d'entrée unique, et c'est
décidable localement.

C'est la même règle que V7 de `fiche-objet-valeur.md` : une seule implémentation couvre les deux. Elle
n'a pas besoin de savoir si le fichier est une racine, un objet-valeur ou une entité — rendre une
collection interne modifiable est fautif dans les trois cas.

### A3 — un indicateur, pas une règle

Compter les repositories d'un contexte et les comparer aux racines déclarées ne produit pas un
verdict mais un **chiffre à regarder**. Un écart important est un signal de conception.

Prérequis : que les racines soient déclarées. Elles ne le sont pas — X2.

### Ce qui n'est pas mécanisable, et pourquoi

A1, A6 et A7 demandent de connaître la frontière de cohérence. Elle n'est écrite nulle part dans le
code, et aucune analyse statique ne peut la déduire.

Ce n'est pas une limite de l'outillage mais une absence d'information. La conséquence pratique est
l'ordre ci-dessous : déclarer avant d'outiller.

### Ordre de mise en œuvre

1. **X2** — déclarer les racines et leur invariant de frontière, par contexte
2. **X1** — appliquer le test du § 1 aux dossiers `aggregates/` et renommer selon le résultat
3. **A2** — la règle ESLint, mutualisée avec V7
4. **A3** — le script d'indicateur, une fois X2 fait
5. **A1** — la revue devient possible, sur la phrase déclarée

Les deux premiers points ne sont pas de l'outillage. C'est la particularité de cette fiche.

### Codemods

Sans objet, à une exception près. Déplacer une frontière est de la modélisation, et aucun codemod ne
peut décider si un objet a une règle commune.

L'exception est X1 : une fois le classement fait, déplacer un fichier de `aggregates/` vers
`read-models/` et réécrire ses imports est mécanique. Le codemod applique la décision, il ne la prend
pas.

---

## 7. Le type

Le typage aide peu sur cette fiche, et il faut le dire plutôt que de laisser croire l'inverse. **Une
frontière de cohérence n'est pas une propriété de type.** Aucune annotation ne dit « ces trois objets
doivent être cohérents ensemble ».

Deux points où il apporte quand même quelque chose.

**E7 devient lisible dans la signature.** `organizationId: number` plutôt qu'`organization:
Organization` est visible à la lecture, donc revu. Avec des identifiants typés — un `OrganizationId`
distinct d'un `number` — la confusion entre deux identifiants devient une erreur de compilation. C'est
le sujet de l'ADR 19, qui l'a écarté pour son coût.

**A2 se rapproche.** `readonly items: readonly Item[]` empêche la modification par l'appelant au
typage. Mais `readonly` est effacé à la compilation : la protection est statique seulement, et la
copie à l'accesseur reste nécessaire pour tout appelant JavaScript. A2 repose sur la copie, pas sur le
type.

La forme retenue est la classe, comme pour toute entité — voir § 7 de `fiche-entite.md`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| La racine | **unitaire pur**, aucun double | l'invariant de frontière, sur le cas passant **et** sur le refus |
| Chaque opération modifiant l'agrégat | **unitaire** | que l'invariant tient après l'opération, y compris en cas d'échec partiel |
| Le repository de la racine | **intégration** | que l'agrégat est chargé et sauvegardé **entier** |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6 de
`fiche-entite.md`.

**Le test caractéristique de cette fiche**, et celui qui manque presque toujours : prouver qu'une
opération qui violerait l'invariant de frontière est refusée. C'est le seul qui distingue un agrégat
d'une entité avec des objets à côté.

La borne : il n'est écrivable que si l'invariant de frontière est formulé. Un agrégat dont personne ne
sait énoncer la règle n'a pas ce test parce qu'il n'a pas cette règle — et c'est A1 qui est en défaut,
pas la couverture.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce que la règle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

Les quatre dernières lignes reprennent les invariants hérités de `fiche-entite.md` qui portent
différemment sur une racine.

```
[ ] [humain]  A1  L'invariant de frontière est nommable : « à tout instant, … doit être vrai »
[ ] [auto]    A2  Aucun accès à un objet interne sans passer par la racine, accesseurs compris
[ ] [humain]  A6  L'ajout ne fait pas charger des données inutiles à la plupart des opérations
[ ] [humain]  A7  L'opération ne modifie qu'un agrégat, ou la cohérence différée est explicite
[ ] [partiel] A3  Un seul repository pour cette frontière — sinon, la convention est-elle assumée ?
[ ] [humain]  Un test prouve le refus d'une opération qui violerait l'invariant de frontière
[ ] [humain]  Si aucun invariant de frontière n'est nommable, ce n'est pas un agrégat — le ranger ailleurs
[ ] [partiel] E3  L'invariant tient après chaque opération, échec à mi-chemin compris
[ ] [auto]    E6  Aucun assemblage par mutateurs successifs appelés de l'extérieur
[ ] [humain]  E7  Les autres agrégats sont référencés par identifiant, jamais par instance
[ ] [auto]    E4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
```

À terme il reste sept lignes, toutes de jugement. C'est la fiche la moins mécanisable du corpus, et
la raison est structurelle : ses invariants portent sur une frontière que le code ne déclare pas.
X2 est ce qui déplacerait cette limite.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **A1** frontière de cohérence | Evans, *DDD*, ch. « The Life Cycle of a Domain Object » — Aggregate. Vernon, « Effective Aggregate Design », règle 1 : *model true invariants in consistency boundaries* | *DDD Reference* ; dddcommunity.org |
| **A2** point d'entrée unique | Evans, même ch. — c'est la définition de la racine | *DDD Reference* |
| **A3** un repository par racine | Evans, même ch. — le Repository porte sur les agrégats, pas sur les entités internes | *DDD Reference* |
| **A6** petit agrégat | Vernon, règle 2 : *design small aggregates* | dddcommunity.org |
| **A7** une transaction, un agrégat | Vernon, règle 4 : *use eventual consistency outside the boundary*. **Pix décide l'inverse pour le cas échouer-ensemble** : l'ADR 25, qui remplace les ADR 9 et 10, interdit les événements dans une transaction sur un motif mesuré. Voir `X4` | ADR 25 ; dddcommunity.org |
| Le test de discrimination | Evans, même ch. | *DDD Reference* |
| **X2** déclarer les racines | **aucune source.** La théorie ne prescrit pas de fichier ; l'écart est avec la vérifiabilité | — |
| Identifiants typés (§ 7) | **ADR 19**, qui écarte le typage des identifiants côté domaine pour son coût | ADR 19 |

Vernon, « Effective Aggregate Design » — trois articles gratuits :
<https://www.dddcommunity.org/library/vernon_2011/>

**Aucun invariant propre n'est sans source.** En contrepartie, aucun n'est adossé à un ADR : la façon
dont Pix place ses frontières d'agrégat n'a jamais été décidée par écrit. C'est ce que cette fiche
sert à ouvrir, et X2 est le premier pas.
