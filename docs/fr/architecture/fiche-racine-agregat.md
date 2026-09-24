# Fiche — Aggregate Root

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - Appliquée telle quelle, cette fiche disqualifie du code existant : peu d'objets satisfont A1 et
>   A2. Elle sert d'abord à régler un débat de conception, ensuite à contrôler du code.
> - A7 est l'invariant de la littérature. Pix a décidé autrement dans l'ADR 25, pour les écritures
>   qui doivent échouer ensemble. Lire A7 avec X4 au § 5, sinon la fiche paraît prescrire ce que le
>   dépôt contredit.
> - Les numéros A4 et A5 ne sont pas attribués. Ils portaient des invariants identiques à E7 et E3 de
>   `fiche-entite.md`, avec des ROI inversés. Les énoncés vivent dans `fiche-entite.md`, et les
>   numéros ne sont pas réattribués.
> - X2 (aucune racine n'est déclarée) bloque le calcul de l'indicateur de A3 et la revue de A1. À
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
| [**A6**](#a6-petit-aggregate) | petit Aggregate | moyenne | revue |
| [**A7**](#a7-une-transaction-un-aggregate) | une transaction, un Aggregate | moyenne | revue |
| [**A3**](#a3-un-repository-par-racine-et-seulement-pour-les-racines) | un repository par racine | hygiène | indicateur, après X2 |

[**Invariants hérités de l'Entity**](#les-invariants-hérités-de-lentity) : toute racine est une
Entity, donc E1 à E8 de `fiche-entite.md` s'appliquent intégralement. Quatre sont repris ci-dessous :
E3 et E7 jouent un rôle particulier pour une racine, E4 et E6 reviennent dans la checklist du § 9.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**E3**](fiche-entite.md#e3-les-invariants-sont-tenus-à-tout-instant) | les invariants sont tenus à tout instant | **forte** | règle ESLint, bruyante |
| [**E6**](fiche-entite.md#e6-aucun-mutateur-nu) | aucun mutateur nu | **forte** | règle ESLint |
| [**E7**](fiche-entite.md#e7-les-autres-aggregates-sont-référencés-par-identité) | les autres Aggregates sont référencés par identité | **forte** | revue |
| [**E4**](fiche-entite.md#e4-aucune-io-aucune-dépendance-à-linfrastructure) | aucune I/O, aucune dépendance à l'infrastructure | moyenne | `dependency-cruiser`, partielle |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-le-mot--aggregate--est-posé-sur-des-dossiers-sans-frontière-nommable) | le mot « Aggregate » est posé sur des dossiers sans frontière nommable | **à corriger** |
| [**X2**](#x2-aucune-racine-nest-déclarée-nulle-part) | aucune racine n'est déclarée nulle part | **à corriger** |
| [**X4**](#x4-une-opération-modifie-plusieurs-aggregates-dans-la-même-transaction) | une opération modifie plusieurs Aggregates dans la même transaction | rien à faire |

Hors numérotation : le [test de discrimination](#le-test-de-discrimination) du § 1. En trois
questions, il dit s'il y a un Aggregate ou non.

---

## 1. Rôle

Un Aggregate est un **groupe d'objets traité comme une unité de cohérence**. Sa racine est l'Entity par
laquelle passe tout accès : rien de ce qu'il contient n'est atteignable autrement.

Sa raison d'être tient en une phrase : il existe une règle qui porte sur plusieurs objets à la fois,
et quelqu'un doit garantir qu'elle est vraie en permanence. C'est la racine.

S'il n'y a pas de telle règle, il n'y a pas d'Aggregate. Il reste une Entity, et des objets à côté.
Poser le mot sur un dossier sans cette règle promet une garantie qui n'existe pas. Cela coûte plus
cher que de ne pas ranger du tout. Voir X1 au § 5.

### Le test de discrimination

Dans cet ordre :

1. *Existe-t-il une règle qui porte sur plusieurs de ces objets simultanément ?* Si non, ce n'est pas
   un Aggregate.
2. *Cette règle doit-elle être vraie en permanence, ou peut-elle se réconcilier plus tard ?* Si elle
   peut attendre, la frontière est ailleurs.
3. *Y a-t-il un objet par lequel tout accès doit passer ?* C'est la racine.

Contre-exemple courant, qui échoue à la première question : « ces objets sont toujours affichés
ensemble » n'est pas une règle de cohérence, c'est un besoin de lecture. Il appelle un read-model.

### Aggregate Root ou Entity

Toute Aggregate Root est une Entity, et `fiche-entite.md` s'applique intégralement. Cette fiche
ajoute ce qui est propre à la racine : la frontière, le point d'entrée unique, le repository.

Une Entity qui vit **à l'intérieur** d'un Aggregate n'est pas une racine : elle n'a ni repository, ni
accès direct.

### Ce qu'une Aggregate Root n'est pas

Si le code correspond à une ligne, ce n'est pas une Aggregate Root.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| n'a pas de règle commune à plusieurs objets à tenir en permanence | une Entity, dans `domain/models/` | `fiche-entite.md` |
| regroupe des objets pour une lecture, sans règle commune | un read-model, dans `domain/read-models/` | `fiche-read-model.md` |
| n'a pas d'identité | un Value Object | `fiche-objet-valeur.md` |
| est construit par une suite de mutateurs appelés de l'extérieur | un constructeur dédié, ou un read-model | `fiche-read-model.md` |
| coordonne plusieurs Aggregates | `domain/usecases/` | `fiche-usecase.md` |
| applique une règle qui ne relève d'aucun Aggregate, sans I/O | `domain/services/` | `fiche-service-domaine.md` |
| compose des règles évaluables et pilotées par des données | une Specification | `fiche-specification.md` |

---

## 2. Invariants

### Les invariants hérités de l'Entity

Toute racine est une Entity. E1 à E8 de `fiche-entite.md` s'appliquent intégralement, et ne sont pas
redétaillés ici. Deux d'entre eux jouent un rôle particulier pour une racine.

**E3**, *les invariants sont tenus à tout instant*. Pour une Entity simple, l'invariant porte sur ses
propres champs. Pour une racine, il porte sur la frontière entière : après chaque opération, y compris
celle qui échoue à mi-chemin, tout ce que contient l'Aggregate reste cohérent. C'est la formulation forte
de A1.

**E7**, *les autres Aggregates sont référencés par identité*. Pour une Entity simple, c'est une bonne
pratique qui limite le coût d'un chargement. Pour une racine, c'est constitutif : cela définit où
s'arrête la frontière. Une racine qui tient l'instance d'une autre racine n'a pas une frontière. Elle
en a deux confondues.

Le corollaire : à l'intérieur d'un même Aggregate, tenir les instances est normal. C'est la
définition d'un Aggregate, et c'est l'exception que E7 nomme.

### A1. La frontière de cohérence est explicite

**Énoncé.** L'Aggregate existe parce qu'une règle porte sur plusieurs de ses objets à la fois. Cette
règle doit être **nommable**.

Le test consiste à formuler la phrase « à tout instant, dans cet Aggregate, … doit être vrai ». Si la
phrase ne vient pas, il n'y a pas de frontière à protéger.

```
// nommable — il y a un Aggregate, et le code le vérifie
« à tout instant, toute participation portée par un parcours combiné est
  une participation de ce contexte, et non une forme quelconque »

    participations: Joi.array().items(Joi.object().instance(CombinedCourseParticipation))

// non nommable — il n'y en a pas
« ces objets sont toujours chargés ensemble »
```

Le premier énoncé est mince : il contraint un type, pas une quantité métier. Un invariant mince reste
un invariant, mais c'est un signal. Si c'est tout ce que la frontière garantit, une question se pose
aussitôt, reprise plus bas : porter cette collection vaut-il son chargement ?

Le second n'est pas un invariant mais une observation sur les habitudes de chargement. Pour un objet
assemblé pour un écran, c'est le seul énoncé disponible. C'est pourquoi ces objets ne sont pas des
Aggregates.

**Ce qui casse.** Sans frontière nommable, chaque écriture portant sur plusieurs objets est une
décision improvisée : personne ne sait ce qu'une transaction doit couvrir, ni ce qui peut se
réconcilier plus tard.

**Prérequis de vérification.** Cet invariant n'est contrôlable que si la phrase est écrite quelque
part. Elle ne l'est nulle part aujourd'hui. C'est X2 au § 5.

### A2. La racine est le seul point d'entrée

**Énoncé.** Rien de ce que contient l'Aggregate n'est atteignable sans passer par la racine :

- ni par import direct ;
- ni par un repository dédié ;
- ni par un accesseur qui rend la référence interne modifiable.

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
  return this.participations.length;
}
get completedParticipationsCount() {
  return this.participations.filter((participation) => participation.isCompleted()).length;
}
```

Les deux formes coexistent dans le même fichier réel : le champ est public, et la racine expose déjà
deux comptages dérivés. La moitié du travail est faite. Passer `#participations` en privé suffit,
puisque les accesseurs qui remplacent la collection existent déjà.

Ces deux comptages sont la forme qu'Evans autorise pour traverser la frontière : un scalaire calculé,
pas la collection. Voir le § 10.

**Ce qui casse.** La règle de frontière devient contournable, donc ce n'est plus une garantie mais une
convention. Cette différence entre garantie et convention fait tout l'intérêt de la catégorie.

**Conséquence sur les objets internes.** Ils n'ont pas de repository, et leur identité n'a de sens que
dans l'Aggregate. S'ils ont besoin d'être retrouvés indépendamment, ils ne sont pas internes.

### A3. Un repository par racine, et seulement pour les racines

**Énoncé.** Chaque racine a un repository, et seules les racines en ont un. Le nombre de repositories
d'un contexte dit alors combien d'unités de cohérence il a.

```
// fautif — cinq repositories pour une seule frontière de cohérence, détaillé en X4 de fiche-repository.md
infrastructure/repositories/
  combined-courses/
    combined-course-repository.js               getById, save
  combined-course-details-repository.js         findByOrganizationId, avec tout ce qu'un écran affiche
  combined-course-participations/
    combined-course-participation-repository.js une Entity interne à la frontière
    organization-learner-participation-repository.js
  prescription/
    combined-course-participant-repository.js   la même frontière, vue d'un autre besoin

// conforme — un seul repository pour la racine
infrastructure/repositories/
  combined-courses/
    combined-course-repository.js               getById, save
```

C'est l'invariant le plus souvent abandonné en pratique, parce que le découpage réel suit les besoins
de requêtage. A3 se tient ainsi : une lecture dont une mesure montre que charger l'Aggregate entier est
trop cher passe par un read-model, pas par un repository d'Aggregate de plus. Garder le mot
« Aggregate » et multiplier les repositories vide le vocabulaire de son sens.

**Ce qui casse.** Compter les repositories cesse d'être une information. C'est un invariant
d'hygiène : il ne prévient aucun défaut, il préserve la valeur d'un indicateur. L'écart est traité sous X4
de `fiche-repository.md`.

### A6. Petit Aggregate

**Énoncé.** Un Aggregate ne contient que les objets que son invariant de frontière engage. Les autres
objets forment des Aggregates distincts, reliés par identité.

```js
// fautif — le constructeur porte douze champs, alors que la seule chose que la
// frontière garantit porte sur un seul d'entre eux : « participations »
constructor(
  {
    id, code, organizationId, name, description, illustration,
    participations = [], questId, blueprintId = null,
    deletedAt = null, deletedBy = null, baseSurveyUrl = null,
  } = {},
  quest,
) { … }

// conforme — version corrigée : l'Aggregate ne porte que ce que l'invariant engage ;
// le reste (nom, description, illustration…) se charge à part, pour qui en a besoin
constructor({ id, participations = [] } = {}) { … }
```

Un Aggregate grossit naturellement, parce qu'il est commode d'y ajouter ce qui est sous la main. Deux
questions se posent à chaque ajout :

- *cette donnée doit-elle être cohérente avec le reste à tout instant, ou seulement à terme ?*
- *combien de lignes cet ajout fait-il charger pour une opération qui ne s'en sert pas ?*

**Ce qui casse.** Un gros Aggregate se charge entier pour chaque opération, y compris celles qui ne
touchent qu'un champ. Il concentre aussi les écritures concurrentes, donc la contention.

C'est aussi la réponse de la littérature au coût de chargement : réduire l'Aggregate plutôt que le
charger partiellement. Le modèle partiellement rempli est écarté pour la raison exposée dans X4 de
`fiche-repository.md`.

### A7. Une transaction, un Aggregate

**Énoncé.** Une opération modifie **un** Aggregate. Si elle doit en modifier deux, deux voies :

- la frontière est mal placée, et les deux n'en font qu'un ;
- ou ils sont bien distincts, et la cohérence entre eux se règle à terme : un événement, un job, une
  réconciliation.

L'exemple fautif est en X4 au § 5.

```js
// conforme — une seule écriture, un seul Aggregate modifié
export const changeUserLocale = async function ({ userId, locale, userRepository }) {
  const lang = getBaseLocale(locale);

  await userRepository.update({ id: userId, lang, locale });
  return userRepository.get(userId);
};
```

**Ce qui casse.** Une transaction qui couvre plusieurs Aggregates verrouille plus de lignes que
nécessaire, et fait échouer des opérations sans rapport entre elles. Et elle masque une frontière mal
placée : personne ne se pose la question tant que la transaction absorbe le problème.

**La position Pix est différente, et elle est décidée.** L'ADR 25 retient la transaction qui couvre
plusieurs Aggregates quand les écritures doivent échouer ou réussir ensemble. Ces écritures sont alors
orchestrées dans le usecase, sans événements. Le motif de l'ADR est mesuré : des deadlocks constatés
en production, causés par des événements à l'intérieur de transactions.

A7 reste donc l'invariant de la littérature, et garde sa valeur comme question de conception. Si deux
Aggregates doivent toujours changer ensemble, la frontière est peut-être mal placée. Mais ce n'est pas
la règle appliquée. X4 au § 5 détaille l'écart.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un Aggregate réduit à sa seule racine, sans objet interne | **autorisé** et fréquent — l'invariant porte alors sur les seuls champs de la racine |
| Une racine expose une collection en lecture par copie | **autorisé**, c'est la forme correcte de A2 |
| Une lecture qui traverse plusieurs Aggregates | **autorisé** via un read-model — A3 ne contraint que l'écriture |
| Une opération qui touche deux Aggregates via un événement ou un job | **autorisé**, c'est la seconde voie de A7 |
| Une transaction qui couvre plusieurs Aggregates dont les écritures doivent échouer ou réussir ensemble | **autorisé**, c'est la décision de l'ADR 25 : orchestration dans le usecase, sans événements. Voir X4 |
| Un identifiant d'un autre contexte porté comme donnée | **autorisé**, c'est E7 bien appliqué |
| La racine tient les instances de ses objets internes | **autorisé**, c'est la définition d'un Aggregate |
| Plusieurs repositories pour une même frontière | **pas une exception** : c'est X4 de `fiche-repository.md`, une dérive à corriger. Seul un read-model justifié par une mesure de charge reste séparé |
| Un dossier `aggregates/` contenant des read-models | **pas une exception** — c'est X1 |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **A1** frontière explicite | **forte** | Ce qui doit être vrai ensemble est connu, donc aussi ce qu'une transaction doit couvrir. Sans cette réponse, chaque écriture multiple est improvisée |
| **A2** point d'entrée unique | **forte** | La règle ne peut pas être contournée. C'est la différence entre une garantie et une convention |
| **A6** petit Aggregate | moyenne | Moins de contention en écriture, chargements plus rapides, frontières plus faciles à déplacer quand le métier change |
| **A7** une transaction, un Aggregate | moyenne | Les conflits d'écriture concurrente restent raisonnables, et, hors cas échouer-ensemble de l'ADR 25, la question « faut-il une transaction ici ? » a une réponse mécanique |
| **A3** un repository par racine | hygiène | Le nombre de repositories redevient une information sur la conception. Aucun défaut prévenu |

Les invariants hérités gardent le ROI qu'ils ont dans `fiche-entite.md`. **E3** et **E7** y sont
classés en rentabilité forte, et c'est sur une racine que ce classement se justifie le plus.

### L'avertissement propre à cette fiche

Ces rentabilités sont potentielles, pas acquises : elles supposent une frontière correctement placée.
Un Aggregate qui respecte tous les invariants sur une mauvaise frontière n'a aucun ROI. Il sera
seulement plus difficile à corriger, parce que le code s'y sera appuyé.

Sur une frontière mal placée, respecter les invariants aggrave le problème. La conséquence pratique :
la frontière (A1) se place avant tout outillage.

### Ce que ça n'apporte pas

Ces invariants ne disent pas **où** placer la frontière. Ils disent ce qui doit tenir une fois
qu'elle est posée. Le placement est un travail de modélisation avec le métier, pas une déduction
depuis le code.

---

## 5. Écarts avec la théorie

Le numéro **X3** n'est pas attribué. Il portait « plusieurs repositories pour une même frontière ».
C'est énoncé au § 5 de `fiche-repository.md` sous `X4`, là où se trouvent les fichiers en cause. Le
symptôme vu d'ici est A3 qui tombe. Le numéro n'est pas réattribué.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Le mot « Aggregate » est posé sur des dossiers sans frontière nommable | dérive | Le dossier promet une garantie qui n'existe pas. Un relecteur y cherche des invariants absents, et leur absence passe pour normale | Un rangement, quel qu'il soit | **À corriger** |
| **X2** Aucune racine n'est déclarée nulle part | dérive | A1 n'est vérifiable ni par un humain ni par un outil, et l'indicateur de A3 est incalculable | Nul | **À corriger** |
| **X4** Une opération modifie plusieurs Aggregates dans la même transaction | convention assumée | Une transaction verrouille plus que nécessaire, et masque une frontière mal placée | Réel et **mesuré** — l'alternative par événements a causé des deadlocks en production, et la cohérence immédiate évite tout appareil de compensation | *Rien à faire* |

### X1. Le mot « Aggregate » est posé sur des dossiers sans frontière nommable

**Ce que dit la théorie.** Un Aggregate existe s'il y a une règle portant sur plusieurs objets à tenir
en permanence. Sans cette règle, il n'y a pas d'Aggregate.

**Exemple concret.** Un dossier qui annonce une frontière de cohérence, mais contient des projections
de lecture. Deux dossiers `aggregates/` réels, de contextes distincts, sont réunis ici sous un chemin
générique :

```
domain/models/<un-domaine>/
  aggregates/
    …Details.js                  → assemblé pour un écran : aucune règle commune
    …ParticipationDetails.js     → idem
    DataFor….js                  → le candidat d'une Specification : un Value Object
```

Le mot annonce des invariants tenus. Un relecteur qui ne les trouve pas conclut que la fiche est mal
appliquée. En réalité, ces objets n'avaient rien à faire là.

**Correction.** Appliquer le test du § 1, fichier par fichier, et renommer le dossier selon le
résultat.

1. Aucune règle commune, assemblé pour une lecture → c'est un **read-model**, il va dans
   `domain/read-models/`. `fiche-read-model.md` s'applique.
2. Une règle commune nommable → c'est un Aggregate, le dossier garde son nom, et la phrase de A1
   s'écrit. C'est X2.
3. Une seule Entity et des objets à côté, sans règle commune → le dossier n'a pas à s'appeler
   `aggregates/`.

Le renommage retire une promesse non tenue. Il coûte peu, une fois chaque fichier classé.

### X2. Aucune racine n'est déclarée nulle part

**Ce que dit la théorie.** Rien, directement : la théorie ne prescrit pas de fichier. L'écart est
avec la vérifiabilité, pas avec le livre.

**Exemple concret.** A1 demande qu'une phrase soit nommable. A3 demande de comparer le nombre de
repositories au nombre de racines. Ni l'une ni l'autre information n'existe sous une forme lisible :
les obtenir demande d'ouvrir chaque modèle et de deviner.

**Correction.** Déclarer les racines par contexte, avec leur invariant de frontière. Un fichier de
quelques lignes suffit :

```md
## Aggregate Roots de ce contexte

- **CombinedCourse** — à tout instant, toute participation portée est une participation
  de ce contexte
- **CombinedCourseBlueprint** — _invariant de frontière non formulé_
```

La deuxième ligne est le vrai apport du fichier. Une racine dont personne n'a écrit ce qu'elle
garantit se voit immédiatement.

Pour un coût faible, ce fichier permet :

- de revoir A1 ;
- de calculer l'indicateur de A3 ;
- de donner un point de comparaison à A6.

X2 est donc le prérequis de la revue de A1 et de l'indicateur de A3.

Le vrai levier n'est pas l'outillage, c'est la déclaration. Tant qu'aucun fichier ne dit « voici
les racines de ce contexte et ce que chacune garantit », aucune analyse statique ne peut le déduire.

### X4. Une opération modifie plusieurs Aggregates dans la même transaction

**Ce que dit la théorie.** Vernon, règle 4 : la cohérence hors de la frontière se règle à terme. Une
transaction couvre un Aggregate.

**Exemple concret.** Un usecase transactionnel qui écrit dans deux frontières distinctes :

```js
export const updateUserPassword = withTransaction(async function ({ … }) {
  const user = await userRepository.getByEmail(email);
  …
  await authenticationMethodRepository.updatePassword({ userId, hashedPassword });
  await userRepository.updateEmailConfirmed(userId);   // autre Aggregate
});
```

`User` et `AuthenticationMethod` sont deux Aggregates. Un mot de passe changé sans courriel confirmé,
ou l'inverse, laisse un compte dans un état dont personne ne veut. Ces deux écritures doivent échouer
ensemble. La cohérence à terme n'y répondrait pas : elle laisserait une fenêtre pendant laquelle le
compte est cassé.

**Correction.** Aucune, et ce n'est pas une tolérance. C'est une décision, portée par l'ADR 25.

Pix enchaînait des traitements par événements à l'intérieur des transactions. C'est la forme qui
aurait permis de découper. L'ADR 25 cite un usecase qui le faisait encore au moment de sa rédaction.
Ces événements dans des transactions ont causé des deadlocks en production, en épuisant le pool de
connexions. L'ADR 25 en tire deux règles :

- plus d'événements dans une transaction ;
- les écritures qui doivent échouer ensemble sont orchestrées dans le usecase, sans événements. La
  transaction est conservée, même si elle couvre plusieurs Aggregates.

C'est donc un bénéfice mesuré, ce qui suffit à classer l'écart en *rien à faire*. La grille du gabarit
est explicite : une mesure change le verdict, une intuition non. Ici la mesure existe, et elle va
contre la littérature.

Sur du code neuf, la question de A7 se pose avant tout élargissement de transaction. Une transaction
qui grossit reste un signal possible de frontière mal placée, et c'est le seul moment où ce défaut se
voit.

**Révision.** De la contention mesurée sur une de ces transactions change ce verdict. C'est le même
type de preuve que celle qui a produit l'ADR 25.

---

## 6. Vérification déterministe

Presque tout ici demande de savoir ce qui appartient à la même frontière. Cette information n'est
écrite nulle part : c'est X2.

Il n'existe pas de plugin ESLint maison. Toute règle sur mesure suppose d'abord de créer cette
infrastructure, et les coûts ci-dessous ne comptent que la règle.

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
n'a pas besoin de savoir si le fichier est une racine, un Value Object ou une Entity. Rendre une
collection interne modifiable est fautif dans les trois cas.

### A3 — un indicateur, pas une règle

Compter les repositories d'un contexte et les comparer aux racines déclarées ne produit pas un
verdict mais un **chiffre à regarder**. Un écart important est un signal de conception.

Prérequis : que les racines soient déclarées. Elles ne le sont pas. C'est X2.

### Ce qui n'est pas mécanisable, et pourquoi

A1, A6 et A7 demandent de connaître la frontière de cohérence. Elle n'est écrite nulle part dans le
code, et aucune analyse statique ne peut la déduire.

Ce n'est pas une limite de l'outillage mais une absence d'information. La conséquence pratique est
l'ordre ci-dessous : la déclaration précède l'outillage.

### Pièges d'implémentation

- L'indicateur de A3 calculé avant X2 : le rapport compare alors un nombre de repositories à zéro
  racine déclarée, ce qui ne produit rien de lisible.
- Le codemod de X1 lancé avant le classement de chaque fichier par le test du § 1 : il applique une
  décision qui n'a pas encore été prise, et déplace au hasard.
- La règle ESLint de A2 écrite sans mutualisation avec V7 de `fiche-objet-valeur.md` : la même
  vérification finit dupliquée dans deux fiches.

### Ordre de mise en œuvre

L'ordre suit le coût et les dépendances entre points, pas le ROI du § 4 : A1, le plus rentable,
vient en dernier parce qu'il dépend de X2.

1. **X2** : déclarer les racines et leur invariant de frontière, par contexte
2. **X1** : appliquer le test du § 1 aux dossiers `aggregates/` et renommer selon le résultat
3. **A2** : la règle ESLint, mutualisée avec V7
4. **A3** : le script d'indicateur, une fois X2 fait
5. **A1** : la revue devient possible, sur la phrase déclarée

Les deux premiers points ne sont pas de l'outillage.

### Codemods

Sans objet, à une exception près. Déplacer une frontière est de la modélisation, et aucun codemod ne
peut décider si un objet a une règle commune.

L'exception est X1 : une fois le classement fait, déplacer un fichier de `aggregates/` vers
`read-models/` et réécrire ses imports est mécanique. Le codemod applique la décision, il ne la prend
pas.

---

## 7. Le type

Le typage aide peu ici. Une frontière de cohérence n'est pas une propriété de type. Aucune annotation
ne dit « ces trois objets doivent être cohérents ensemble ».

Deux points où il apporte quand même quelque chose.

**E7 devient lisible dans la signature.** `organizationId: number` plutôt qu'`organization:
Organization` est visible à la lecture, donc revu. Avec des identifiants typés, un `OrganizationId`
distinct d'un `number`, la confusion entre deux identifiants devient une erreur de compilation. C'est
le sujet de l'ADR 19, qui a écarté les identifiants typés pour leur coût.

**A2 se rapproche.** `readonly items: readonly Item[]` empêche la modification par l'appelant au
typage. Mais `readonly` est effacé à la compilation : la protection est statique seulement, et la
copie à l'accesseur reste nécessaire pour tout appelant JavaScript. A2 repose sur la copie, pas sur le
type.

La forme retenue est la classe, comme pour toute Entity. Voir § 7 de `fiche-entite.md`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| La racine | **unitaire pur**, aucun double | l'invariant de frontière, sur le cas passant **et** sur le refus |
| Chaque opération modifiant l'Aggregate | **unitaire** | que l'invariant tient après l'opération, y compris en cas d'échec partiel |
| Le repository de la racine | **intégration** | que l'Aggregate est chargé et sauvegardé **entier** |

L'existence du fichier de test se vérifie en comparant les noms. Moyens et limites au § 6 de
`fiche-entite.md`.

**Le test le plus caractéristique**, et celui qui manque presque toujours, prouve qu'une opération
qui violerait l'invariant de frontière est refusée. C'est le seul qui distingue un Aggregate d'une
Entity avec des objets à côté.

Ce test ne peut s'écrire que si l'invariant de frontière est formulé. Un Aggregate dont personne ne
sait énoncer la règle n'a pas ce test, parce qu'il n'a pas cette règle. C'est A1 qui est en défaut,
pas la couverture.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant pour les invariants propres, comme au § 4, puis les invariants hérités.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle correspondante existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est connu.

Les quatre dernières lignes reprennent des invariants hérités de `fiche-entite.md`. E3 et E7 portent
différemment sur une racine, E4 et E6 s'y appliquent comme sur toute Entity.

```
[ ] [humain]  A1  L'invariant de frontière est nommable : « à tout instant, … doit être vrai »
[ ] [auto]    A2  Aucun accès à un objet interne sans passer par la racine, accesseurs compris
[ ] [humain]  A6  L'ajout ne fait pas charger des données inutiles à la plupart des opérations
[ ] [humain]  A7  L'opération ne modifie qu'un Aggregate, ou la cohérence différée est explicite, ou les écritures doivent échouer ensemble (ADR 25)
[ ] [partiel] A3  Un seul repository pour cette frontière — sinon, la convention est-elle assumée ?
[ ] [humain]  Un test prouve le refus d'une opération qui violerait l'invariant de frontière
[ ] [humain]  Si aucun invariant de frontière n'est nommable, ce n'est pas un Aggregate — le ranger ailleurs
[ ] [partiel] E3  L'invariant tient après chaque opération, échec à mi-chemin compris
[ ] [auto]    E6  Aucun assemblage par mutateurs successifs appelés de l'extérieur
[ ] [humain]  E7  Les autres Aggregates sont référencés par identifiant, jamais par instance
[ ] [partiel] E4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
```

À terme, il reste neuf lignes : trois `[partiel]` (A3, E3, E4) et six `[humain]`. La raison est
structurelle : les invariants portent sur une frontière que le code ne déclare pas. X2 est ce qui
déplacerait cette limite.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **A1** frontière de cohérence | Evans, *DDD*, ch. « The Life Cycle of a Domain Object » — Aggregate. Vernon, « Effective Aggregate Design », règle 1 : *model true invariants in consistency boundaries* | *DDD Reference* ; dddcommunity.org |
| **A2** point d'entrée unique | Evans, même ch. — c'est la définition de la racine | *DDD Reference* |
| **A3** un repository par racine | Evans, même ch. — le Repository porte sur les Aggregates, pas sur les Entities internes | *DDD Reference* |
| **A6** petit Aggregate | Vernon, règle 2 : *design small aggregates* | dddcommunity.org |
| **A7** une transaction, un Aggregate | Vernon, règle 4 : *use eventual consistency outside the boundary*. **Pix décide l'inverse pour le cas échouer-ensemble** : l'ADR 25, qui remplace les ADR 9 et 10, interdit les événements dans une transaction sur un motif mesuré. Voir `X4` | ADR 25 ; dddcommunity.org |
| Le test de discrimination | Evans, même ch. | *DDD Reference* |
| **X2** déclarer les racines | **aucune source.** La théorie ne prescrit pas de fichier ; l'écart est avec la vérifiabilité | — |
| Identifiants typés (§ 7) | **ADR 19**, qui écarte le typage des identifiants côté domaine pour son coût | ADR 19 |

Vernon, « Effective Aggregate Design », trois articles gratuits :
<https://www.dddcommunity.org/library/vernon_2011/>

Tous les invariants propres ont une source. Mais aucun n'est appuyé sur un ADR : la façon dont Pix
place ses frontières d'Aggregate n'a jamais été décidée par écrit. X2 est le premier pas pour écrire
cette décision.
