# Fiche — Objet-valeur

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de mordre est dans `migration-typescript.md`.

> **À instruire**
>
> - Le § 6 annonce des taux de faux positifs estimés, pas mesurés. À éprouver sur le code avant de
>   rendre une règle bloquante.
> - V3 est aussi l'invariant d'entrée d'une Specification, où il élimine le cas de l'arbre malformé à
>   l'évaluation. `fiche-specification.md` y renvoie et n'en garde pas de numéro propre.
> - Les clés de présentation existantes n'ont pas été classées selon les trois cas de V2. Ce classement
>   conditionne X5, et se fait fichier par fichier.
> - Les numéros d'écart commencent à X2 : X1 et X6 portaient sur le read-model et ont suivi la création
>   de `fiche-read-model.md`. Les numéros ne sont pas réattribués.
> - **Contradiction tranchée le 2026-09-08**, comme dans `fiche-entite.md` : la fiche garde sa règle.
>   Le motif retenu est qu'un champ qui porte une règle ne doit pas pouvoir être réécrit de
>   l'extérieur — ce qui, pour un objet-valeur immuable par définition, vaut pour tous ses champs.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants**

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**V1**](#v1-immuable-après-construction) | immuable après construction | moyenne | règle ESLint |
| [**V2**](#v2-aucune-identité-égalité-par-valeur) | aucune identité, égalité par valeur | moyenne | règle ESLint, après X5 |
| [**V3**](#v3-validation-à-la-construction) | validation à la construction | **forte** | revue |
| [**V4**](#v4-aucune-io-aucune-dépendance-à-linfrastructure) | aucune I/O, aucune dépendance à l'infrastructure | moyenne | `dependency-cruiser` |
| [**V5**](#v5-porte-le-comportement-lié-à-ses-données) | porte le comportement lié à ses données | **forte** | revue |
| [**V6**](#v6-aucun-cycle-de-vie-propre) | aucun cycle de vie propre | hygiène | script |
| [**V7**](#v7-exposition-en-lecture-seule-collections-comprises) | exposition en lecture seule, collections comprises | moyenne | règle ESLint |
| [**V8**](#v8-un-type-par-intention) | un type par intention | moyenne | revue, puis typage |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X5**](#x5-la-clé-de-présentation-est-fabriquée-dans-le-domaine) | la clé de présentation est fabriquée dans le domaine | **à corriger** |
| [**X7**](#x7-les-modèles-se-multiplient-par-intention-décriture-sans-mesure) | les modèles se multiplient par intention d'écriture, sans mesure | **à corriger** |
| [**X2**](#x2-les-valeurs-sont-validées-à-la-frontière-http-pas-par-leur-type) | les valeurs sont validées à la frontière HTTP, pas par leur type | à surveiller |
| [**X3**](#x3-validation-à-la-construction-de-chaque-objet-valeur) | validation à la construction de chaque objet-valeur | rien à faire |
| [**X4**](#x4-limmuabilité-nest-pas-garantie-par-le-langage) | l'immuabilité n'est pas garantie par le langage | rien à faire |

Deux artefacts hors numérotation, souvent cherchés : le [discriminant](#le-discriminant) avec le
read-model et ses quatre tests ; et le [cas de la clé de présentation](#le-cas-de-la-clé-de-présentation)
avec ses trois cas.

---

## 1. Rôle

Un **objet-valeur** est défini par ses attributs, pas par une identité. Deux instances portant les
mêmes valeurs sont interchangeables. Il est immuable, il ne se persiste pas seul, et il porte le
comportement lié à ses données. Il transforme une primitive sans signification — `string`, `number`,
un objet littéral — en concept nommé qui protège ses propres règles.

La catégorie avec laquelle il se confond est le **read-model** : une forme assemblée pour une lecture,
que le domaine ne lit pas pour décider. Elle a sa fiche, `fiche-read-model.md`.

Le discriminant entre les deux est énoncé ici, une fois, parce qu'il n'appartient à aucune des deux
catégories et que les deux fiches y renvoient.

### Le discriminant

Une seule question sépare l'objet-valeur du read-model :

> **Le domaine raisonne-t-il avec cet objet ?**

| Réponse | Catégorie | Invariants |
| --- | --- | --- |
| Une règle du domaine lit ses valeurs pour décider | **objet-valeur** | V1 à V8 |
| Il est assemblé pour être lu, puis sérialisé ou affiché | **read-model** | V1, V2, V4, V6, V7, puis RM1 à RM4 de `fiche-read-model.md` |

Les cinq invariants communs — immuabilité, absence d'identité, pureté, absence de cycle de vie,
exposition en lecture seule — s'appliquent aux deux. Ce qui diffère est la validation et le
comportement.

Le discriminant se lit dans le code, pas dans le dossier : un objet rangé dans `read-models/` mais lu
par une règle est un objet-valeur mal rangé, et il doit alors satisfaire V3 et V5.

#### Quatre tests pour l'appliquer

La question de principe est juste mais abstraite. Ces quatre tests la tranchent plus vite, et ils
concordent presque toujours.

| Test | Objet-valeur | read-model |
| --- | --- | --- |
| **Existence** — si l'interface disparaissait, l'objet existerait-il encore ? | oui : le concept préexiste à son affichage | non : il disparaîtrait avec l'écran |
| **Champs** — qui a choisi les champs ? | le concept métier. En retirer un casse le concept | un besoin d'affichage. En retirer un allège la réponse |
| **Portée** — combien de lecteurs ? | petit, et réutilisé partout | large, et consommé par un seul point d'entrée |
| **Nom** — que dit le nom ? | un nom du langage métier | un nom qui trahit son consommateur : `…ForAdmin`, `…Overview`, `…Details`, `…ListItem` |

#### Le piège : dérivation n'est pas règle

C'est la principale source de confusion entre les deux catégories. Une **dérivation de présentation**
— un total, un pourcentage, un libellé composé — n'est pas une règle métier. Un read-model peut donc
porter des méthodes sans devenir un objet-valeur.

La question n'est pas « a-t-il du comportement ? » mais « **ce comportement décide-t-il quelque
chose ?** »

```js
// objet-valeur : petit, nommé par le métier, porte une règle qui décide
class Threshold {
  #value;
  constructor({ value }) { /* validation */ this.#value = value; }
  isReachedBy(percentage) { return percentage >= this.#value; }
}

// read-model : large, nommé par son écran, dérive sans décider
class CampaignOverviewForAdmin {
  constructor({ campaignName, organizationName, participantCount, completedCount }) { … }
  get completionRate() { return this.completedCount / this.participantCount; }
}
```

#### La zone grise

Quand les tests ne concordent pas, classer en **read-model**. Ce n'est pas de la prudence, c'est que
l'erreur se corrige seule.

Un objet-valeur pris pour un read-model se signale dès qu'une règle veut le lire : c'est RM3, que la
règle de chemin du § 6 détecte. L'erreur inverse ne se signale jamais — on écrit une validation et des
règles dont personne n'avait besoin, et aucun outil ne le dira.

### Ce qu'est un objet du domaine local

Notion utilisée par les invariants d'entrée et de sortie d'un repository, dans `fiche-repository.md`.

Un objet du domaine local est un type déclaré dans le `domain/` **du contexte courant**, dont ce
contexte contrôle la construction.

| Est un objet du domaine local | N'en est pas un |
| --- | --- |
| une entité, une racine d'agrégat | une ligne de base de données |
| un objet-valeur | une charge utile HTTP désérialisée |
| un read-model produit par un repository du contexte | le DTO publié par l'API interne d'un autre contexte |

La dernière ligne de droite est celle qu'on oublie : le format d'un voisin est de l'extérieur, même
quand il est déjà en forme d'objet. Sa traduction est le travail du repository.

### Ce qu'un objet-valeur n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un objet-valeur.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| est assemblé pour une lecture, et aucune règle ne le lit | un read-model, dans `domain/read-models/` | `fiche-read-model.md` |
| a besoin d'être retrouvé, suivi, mis à jour dans le temps | une entité, dans `domain/models/` | `fiche-entite.md` |
| coordonne plusieurs objets pour tenir une règle commune | une racine d'agrégat | `fiche-racine-agregat.md` |
| compose des règles évaluables et pilotées par des données | une Specification | `fiche-specification.md` |
| charge ou écrit des données | un repository | `fiche-repository.md` |
| décrit le contrat d'échange avec un autre contexte | `application/api/` | `fiche-api-interne.md` |
| met en forme pour une réponse HTTP, clé de présentation comprise | `infrastructure/serializers/` | `fiche-serialiseur.md` |

---

## 2. Invariants

V1, V2, V4, V6 et V7 s'appliquent aussi au read-model, qui y renvoie depuis sa propre fiche. V3, V5 et
V8 sont propres à l'objet-valeur.

### V1. Immuable après construction

Aucune écriture après le constructeur. Ni mutateur, ni champ public assignable.

```js
// conforme
class Code {
  #value;
  constructor({ value }) { /* validation */ this.#value = value; }
  get value() { return this.#value; }
}

// fautif — champ public, modifiable de l'extérieur
class Code {
  value;
  constructor({ value }) { this.value = value; }
}
```

Un changement produit une nouvelle instance, il ne modifie pas l'existante :

```js
withThreshold(threshold) { return new Criterion({ ...this.toValues(), threshold }); }
```

**Ce qui casse.** Un objet-valeur mutable partagé entre deux évaluations, ou mis en cache, change sous
les pieds de son deuxième lecteur. Le défaut se manifeste loin de sa cause.

**Piège sur les classes de base.** Une hiérarchie peut être irréprochable dans ses sous-classes et
exposer des champs publics sur sa classe abstraite. L'invariant se vérifie sur toute la chaîne.

### V2. Aucune identité, égalité par valeur

Pas d'identité propre. Pas de suivi dans le temps. Deux instances de mêmes valeurs sont la même chose.

Un objet-valeur peut **porter** l'identifiant d'autre chose : c'est une donnée comme une autre. Ce qui
est interdit, c'est qu'il ait sa propre identité.

**Test de discrimination.** Si remplacer une instance par une autre de mêmes valeurs change quelque
chose pour le métier, ce n'est pas un objet-valeur, c'est une entité.

**Ce qui casse.** Une identité propre appelle un cycle de vie : quelque chose va vouloir le retrouver,
le mettre à jour, le comparer par référence. La catégorie ne tient plus, et V6 tombe avec elle.

#### Le cas de la clé de présentation

Un client qui met les objets en cache — le store d'une application web — exige une clé par
enregistrement, y compris pour des objets qui n'ont aucune identité. La clé est alors composée, le plus
souvent par concaténation de deux identifiants portés.

Cette clé n'est **pas** une identité du domaine. Trois cas, à ne pas confondre :

| Situation | Nature de la clé | Où elle se fabrique |
| --- | --- | --- |
| Le client a besoin d'une clé de cache, et rien ne la lui renvoie | clé de présentation | le sérialiseur |
| Le client renvoie la clé, et le serveur la découpe pour retrouver ses parties | identifiant composite | un objet-valeur qui porte la paire construire / découper |
| L'objet a une identité métier exprimée par plusieurs attributs | identité composite | c'est une **entité**, et V2 ne s'y applique pas |

Le premier cas est le plus fréquent. Il ne viole V2 que lorsque la clé est fabriquée **dans le
domaine** — voir X5 au § 5. Le deuxième est un identifiant à part entière, donc V3 s'applique à lui.
Le troisième sort de cette fiche.

Comment les distinguer : chercher qui lit la clé. Si personne ne la relit côté serveur, c'est une clé
de cache.

### V3. Validation à la construction

*Objet-valeur uniquement.* Une valeur invalide ne s'instancie pas. L'aval ne valide rien.

```js
// conforme
constructor({ value }) {
  if (value < 0 || value > 100) throw new DomainError('…');
  this.#value = value;
}

// fautif — l'objet invalide existe, puis on s'en aperçoit
constructor({ value }) {
  this.#value = value;
  this.assertValid();
}
```

Trois points de cohérence, sans quoi l'invariant est respecté sans être utile :

- **valider avant d'affecter** quand le message d'erreur doit désigner l'entrée fautive. La convention
  Pix valide `this` après les affectations, contre un schéma déclaratif : voir `X3` de
  `fiche-entite.md`, qui instruit cet écart ;
- **un seul type d'erreur de validation** pour le domaine, sinon les appelants rattrapent et
  reconvertissent ;
- **valider à tous les niveaux** d'une composition, pas seulement à la racine.

**Ce qui casse.** Sans validation à la construction, chaque appelant doit se demander si la valeur est
cohérente. La vérification se duplique, et elle est oubliée quelque part.

### V4. Aucune I/O, aucune dépendance à l'infrastructure

Le symptôme est visible dans les imports :

```js
// dans un fichier de domain/models/ — fautif
import { logger } from '../../../shared/infrastructure/utils/logger.js';
```

Vaut aussi pour la configuration, l'horloge et l'aléatoire. Un objet qui lit l'heure courante n'est
pas testable de façon déterministe : la date entre en paramètre.

**Ce qui casse.** Le test cesse d'être pur : il faut un double. Le besoin d'un double est le symptôme,
pas la cause.

### V5. Porte le comportement lié à ses données

*Objet-valeur uniquement.* Un objet réduit à des champs et des accesseurs n'apporte rien qu'un objet
littéral n'apporte déjà.

```js
// pauvre : un sac de champs typé
class Threshold { #value; get value() { return this.#value; } }

// utile : la règle est là où est la donnée
class Threshold {
  #value;
  isReachedBy(percentage) { return percentage >= this.#value; }
}
```

**Ce qui casse.** La règle qui contraint la donnée s'écrit ailleurs, donc plusieurs fois, donc
différemment.

Un objet-valeur sans comportement dans une famille où d'autres en ont n'est pas une faute à lui seul :
un type nommé peut valoir pour la seule signature. Voir le § 3.

### V6. Aucun cycle de vie propre

Pas de repository, pas de table dédiée, pas de fonction de persistance. Un objet-valeur est persisté
**avec** ce qui le contient, ou pas du tout.

S'il faut le retrouver indépendamment, c'est une entité.

**Ce qui casse.** Un repository dédié à un objet-valeur lui donne une identité de fait — celle par
laquelle on le retrouve — et le fait basculer dans la catégorie des entités sans que personne l'ait
décidé.

### V7. Exposition en lecture seule, collections comprises

Un accesseur qui rend une collection interne rend un tableau modifiable par l'appelant.

```js
// fautif — l'appelant peut pousser dans le tableau interne
get items() { return this.#items; }

// conforme
get items() { return [...this.#items]; }
```

**Attention au gel inopérant.** `Object.freeze` n'affecte pas les champs privés `#` : ce ne sont pas
des propriétés. Geler une instance dont l'état est privé ne protège rien tout en en donnant
l'apparence.

**Ce qui casse.** V1 est annulé de l'extérieur : l'objet est immuable, son contenu ne l'est pas.

### V8. Un type par intention

*Objet-valeur uniquement.* Quand un même concept entre dans le système sous plusieurs formes, chaque
forme a son type.

**Ce qui casse.** Une signature qui accepte l'un accepte l'autre. L'erreur n'apparaît qu'à
l'exécution, sur un champ absent.

**Le discriminant, et il est indispensable**, parce que cet invariant est le vecteur d'une dérive —
voir `X7` au § 5.

Une forme de **création** est un concept distinct : un objet qui n'existe pas encore n'a pas
d'identité, ce qui est une différence de nature et non un raccourci. `…ForCreation` est légitime.

Une forme de **mise à jour** qui porte un sous-ensemble de champs est autre chose : c'est un modèle
partiellement rempli, et `X4` de `fiche-repository.md` explique pourquoi il est à écarter. La question
à poser est celle du motif.

| Motif invoqué | Verdict |
| --- | --- |
| L'objet n'a pas encore d'identité | légitime — c'est un concept distinct |
| Le vocabulaire de l'appel diffère de celui du modèle | légitime — c'est un objet d'entrée nommé |
| On ne veut pas charger l'entité entière, et le coût est **mesuré** | légitime, et à documenter avec la mesure |
| On ne veut pas charger l'entité entière, sans mesure | **ce n'est pas un motif** — charger l'entité, la faire changer par une méthode nommée, la sauver. C'est `E6` de `fiche-entite.md` |

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| Un objet-valeur porte l'identifiant d'autre chose | **autorisé** — c'est une donnée, pas son identité. V2 |
| Un objet-valeur porte une clé composite que le client renvoie | **autorisé** — c'est un identifiant, deuxième cas de V2. V3 s'applique à lui |
| Un accesseur reconstruit un objet à chaque appel | **autorisé** — c'est la forme sûre de V7 |
| Une méthode rend une valeur neutre sur entrée non exploitable plutôt que de lever | **autorisé** |
| Une famille d'objets-valeurs partage une classe de base abstraite | **autorisé** si la base respecte V1 |
| Un objet-valeur sans comportement, dans une famille où d'autres en ont | **à discuter**, pas à signaler seul — un type nommé peut valoir pour la seule signature |
| L'objet est anémique et aucune règle ne le lit | **ce n'est pas un objet-valeur** — appliquer le discriminant du § 1, puis `fiche-read-model.md` |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **V3** validation à la construction | **forte** | Une valeur invalide n'existe pas. Aucun code en aval n'a à se demander si elle est cohérente |
| **V5** comportement porté par l'objet | **forte** | La règle vit à côté de la donnée qu'elle contraint, donc elle n'est pas réécrite dans trois usecases |
| **V1** immuabilité | moyenne | Le partage devient sûr sans copie défensive |
| **V7** exposition en lecture seule | moyenne | Ferme la voie par laquelle V1 est annulé de l'extérieur |
| **V4** pureté | moyenne | Test unitaire sans double, coût d'exécution prévisible |
| **V8** un type par intention | moyenne | La signature devient une garantie, et le typage la rendra vérifiable. À lire avec son discriminant : sans lui, c'est le vecteur de `X7` |
| **V2** aucune identité | moyenne | Rend le classement possible : sans lui, rien ne distingue un objet-valeur d'une entité mal rangée |
| **V6** aucun cycle de vie propre | hygiène | Conséquence de V2. Rien de mesurable ne s'améliore |

### Ce que ça n'apporte pas

Ces invariants ne disent pas **quels** concepts méritent un objet-valeur. Extraire un objet-valeur de
trop est un coût pur ; ne pas en extraire un qui portait une règle laisse la règle se dupliquer. Ce
jugement reste humain.

Ils ne disent pas non plus **si** un concept méritait d'être un objet-valeur plutôt qu'un read-model.
C'est le discriminant du § 1 qui répond, et il repose sur des tests de jugement.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X5** La clé de présentation est fabriquée dans le domaine | dérive | Le domaine connaît le framework de son client. V2 devient invérifiable : tout `id` peut être légitime | Le client fonctionne, et la clé est composée une fois pour tous ses lecteurs | **À corriger** |
| **X7** Les modèles se multiplient par intention d'écriture, sans mesure | dérive | Chaque forme est une vue partielle d'une entité, donc un modèle partiellement rempli. Le nombre de modèles cesse de dire combien de concepts a le contexte | Supposé — éviter de charger l'entité entière. Non mesuré, donc **nul** au regard de la grille | **À corriger** |
| **X2** Les valeurs sont validées à la frontière HTTP, pas par leur type | convention assumée | V3 est doublé ou contourné. Deux identifiants de sens différent ont le même type | Une validation déclarative, en un endroit, avec un message utilisateur | *À surveiller* |
| **X3** Validation à la construction de chaque objet-valeur | convention assumée | Une validation et un type d'erreur par type | Valeur valide par construction. Aval déchargé | *Rien à faire* |
| **X4** L'immuabilité n'est pas garantie par le langage | vestige | Champs privés et accesseurs à écrire à la main | Immuabilité réelle, vérifiable par une règle de lint | *Rien à faire* |

### X5. La clé de présentation est fabriquée dans le domaine

**Ce que dit la théorie.** La règle de dépendance de Clean Architecture : une couche interne ne connaît
pas les couches externes. Un objet du domaine qui compose une clé pour le store d'un client connaît
son consommateur.

**Exemple concret.**

```js
// dans domain/read-models/ — la clé n'existe que pour le store du client
class Row {
  constructor({ id, parentId, name }) {
    this.id = `${id}_${parentId}`;
    this.name = name;
  }
}
```

Le motif se reconnaît à deux traits : l'objet porte déjà les deux parties, et la concaténation n'est
relue par personne côté serveur.

**Correction.** Classer selon les trois cas de V2, puis :

1. **Clé de cache pure** — le sérialiseur la compose depuis les champs qu'il a déjà. L'objet du domaine
   n'a pas d'`id`. C'est le cas majoritaire, et la correction est mécanique.
2. **Clé renvoyée par le client** — un objet-valeur porte la paire construire / découper, et les deux
   vivent ensemble. C'est un identifiant, donc V3 s'applique à lui. Le déplacer dans le sérialiseur
   séparerait les deux moitiés d'une même règle.
3. **Identité métier composite** — l'objet est une entité. Il sort de cette fiche, et rien n'est à
   corriger.

Le classement précède la correction : appliquer le cas 1 à un objet du cas 2 casse la requête entrante
qui renvoie la clé.

### X7. Les modèles se multiplient par intention d'écriture, sans mesure

**Ce que dit la théorie.** Un agrégat se charge entier, parce que c'est ce qui lui permet de garantir
ses invariants. La réponse de la littérature au coût de chargement est de **réduire l'agrégat** —
règle 2 de Vernon — pas de le charger à moitié. Et Fowler prévient que séparer lecture et écriture
ajoute de la complexité et ne doit pas être le défaut.

**Exemple concret.** Un concept, quatre modèles :

```
domain/models/
  Thing.js                  → l'entité
  ThingForCreation.js       → sans identifiant
  ThingForUpdate.js         → un sous-ensemble de champs
  ThingForAdmin.js          → un autre sous-ensemble
```

Les deux derniers ressemblent à des **commandes** au sens de CQRS. C'est la même appropriation que
celle du mot `read-model`, du côté écriture cette fois : on emprunte le vocabulaire de CQRS sans en
avoir l'architecture. Détail dans `references-ddd.md`, section « Read model ».

**Le motif habituel est une optimisation non mesurée** : ne pas charger l'entière. Or la grille de ce
corpus est explicite — un bénéfice invoqué sans mesure compte pour nul. Le coût, lui, est certain :
chaque forme partielle est un modèle qui ne peut garantir aucun invariant, et le nombre de fichiers de
`domain/models/` cesse de dire combien de concepts porte le contexte.

**Correction.** Le discriminant de `V8` tranche fichier par fichier. Ce qui exprime une différence de
nature reste — l'absence d'identité, un vocabulaire d'entrée distinct. Ce qui n'exprime qu'un
sous-ensemble de champs disparaît : on charge l'entité, on la fait changer par une méthode nommée, on
la sauve. C'est `E6` de `fiche-entite.md`.

Ce qui rouvrirait le dossier pour un cas donné : une mesure. Un chargement dont le coût est constaté
en production justifie une forme partielle, et la mesure s'écrit à côté du modèle.

### X2. Les valeurs sont validées à la frontière HTTP, pas par leur type

**Ce que dit la théorie.** Un objet-valeur porte ses règles. Une valeur qui a franchi son constructeur
est valide partout en aval.

**Exemple concret.** La validation déclarative de la route accepte la charge utile, puis des
primitives circulent vers le domaine :

```js
// à la route
validate: { payload: Joi.object({ threshold: Joi.number().min(0).max(100) }) }

// puis, dans le domaine
function apply({ threshold }) { … }   // un number, sans garantie propre
```

L'ADR 19 a examiné le typage des identifiants côté domaine et l'a écarté pour son coût, en retenant la
validation à la route. Son exemple donne d'ailleurs le même type à deux identifiants de sens différent,
ce qui est la limite de l'approche.

**Correction.** Rien d'immédiat, et pas de reprise de l'existant. Ce qui est à tenir : une valeur qui
porte une règle métier — pas seulement une borne de format — traverse le domaine dans son type, pas en
primitive. La validation à la route reste utile pour ce qu'elle fait bien : refuser tôt, avec un
message utilisateur. Les deux ne s'excluent pas ; c'est leur confusion qui coûte.

Réouvrir l'ADR 19 est le préalable si l'équipe veut généraliser. Ne pas l'invoquer comme source à
l'appui du typage : il conclut l'inverse.

### X3. Validation à la construction de chaque objet-valeur

**Ce que dit la théorie.** Chez Evans, l'invariant est tenu à la frontière de l'agrégat. Valider
chaque objet-valeur à sa construction est un durcissement, cohérent avec sa définition mais non
prescrit sous cette forme.

**Exemple concret.** Le durcissement se voit au nombre de constructeurs qui lèvent :

```js
constructor({ value }) {
  if (value < 0 || value > 100) throw new DomainError('…');
  this.#value = value;
}
```

**Correction.** Aucune. Le coût est une validation et un type d'erreur par type ; le bénéfice est
qu'aucun code en aval ne revérifie. C'est V3, classé en rentabilité forte au § 4. À maintenir comme
convention explicite plutôt que comme lecture d'Evans.

### X4. L'immuabilité n'est pas garantie par le langage

**Ce que dit la théorie.** Un objet-valeur est immuable. La théorie suppose un langage capable de le
garantir.

**Exemple concret.** JavaScript n'en a pas le moyen. `Object.freeze` ne touche pas les champs privés,
et `readonly` en TypeScript est effacé à la compilation. La garantie se construit à la main :

```js
class Code {
  #value;                              // inaccessible de l'extérieur
  get value() { return this.#value; }  // aucune écriture exposée
}
```

**Correction.** Aucune sur la forme. Le vestige est le coût d'écriture, pas un défaut de conception.
Ce qui le rend rentable est qu'il est vérifiable : V1 et V7 se contrôlent par une règle de lint, ce
qui n'aurait pas été le cas d'une convention orale — voir § 6.

---

## 6. Vérification déterministe

Les taux de faux positifs annoncés sont estimés. Toute hypothèse sur le comportement d'un outil se
vérifie par contre-épreuve : introduire la violation, confirmer que l'outil sort, retirer la violation.

Il n'existe aucun plugin ESLint maison : toute règle sur mesure suppose d'abord de créer cette
infrastructure, et les coûts ci-dessous ne comptent que la règle. Ce point est daté, à retirer dès que
l'infrastructure existe.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **V4** aucune I/O | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **V1** immuabilité | règle ESLint : champ de classe public | ~30 lignes | aucun attendu |
| **V7** exposition en lecture seule | même règle, élargie | ~30 lignes de plus | faibles |
| **V6** aucun cycle de vie propre | script `tests/tooling/` : aucun repository ne porte le nom d'un objet-valeur | ~20 lignes | faibles |
| **§ 8** un fichier de test existe | même script | ~15 lignes de plus | aucun |
| **X5** clé composée dans le domaine — signal | règle ESLint : affectation à `id` depuis un littéral de gabarit | ~20 lignes | aucun |
| **V2** aucune identité | règle ESLint : accesseur ou champ nommé `id` | ~15 lignes | **nombreux avant X5** — voir plus bas |
| **V3**, **V5**, **V8** | revue | — | — |

### V4 — une règle de chemin

```js
{
  name: 'domain-model-must-not-import-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/domain/models/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Écrire `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et la règle ne se déclenche jamais, sans erreur ni avertissement.

La règle jumelle, qui interdit à une règle du domaine d'importer un read-model, est au § 6 de
`fiche-read-model.md` — c'est son invariant RM3.

### V1 et V7 — une seule règle ESLint

Trois motifs syntaxiques, tous locaux au fichier :

- une déclaration de champ de classe sans `#` ;
- un `Object.freeze(x)` dont la cible n'a que des champs privés, ou dont le résultat n'est pas la
  valeur renvoyée ;
- un accesseur dont le corps est un `return this.#champ` où le champ est initialisé par un tableau.

Le troisième est le plus utile et le plus délicat : il faut remonter à l'initialisation pour connaître
le type. À restreindre au cas évident — champ initialisé à `[]`, ou affecté depuis un paramètre par
défaut `= []`.

### X5 et V2 — dans cet ordre

Les deux règles regardent le même champ, et l'ordre entre elles compte.

**X5 d'abord.** Le signal est syntaxique et sans faux positif :

> Une affectation à une propriété `id`, dont la valeur est un littéral de gabarit, dans un fichier du
> domaine.

La règle ne prouve rien sur la nature de la clé : elle désigne l'endroit où appliquer le classement des
trois cas de V2. C'est sa fonction.

**V2 ensuite.** Un champ ou accesseur `id` dans un fichier d'objet-valeur. Cette règle est inexploitable
avant X5 : les clés de présentation composées dans le domaine la déclenchent toutes, et rien ne les
distingue d'une identité réelle. Une fois X5 traité, il ne reste que les `id` portés — l'identifiant
d'autre chose, autorisé par V2 — qu'une liste d'exclusion couvre.

### V6 et l'existence des tests — un script

Le script parcourt les fichiers d'objets-valeurs et de DTO. Deux vérifications :

- **V6** : aucun fichier de `infrastructure/repositories/` ne porte le nom d'un objet-valeur. Faux
  positifs faibles — une homonymie entre un objet-valeur et une entité est possible.
- **§ 8** : chaque fichier a un fichier de test. La correspondance se fait sur le **nom de base**,
  après retrait du suffixe de test : le fichier peut vivre dans un sous-dossier alors que son test est
  à plat, et le suffixe n'est pas le même partout. La comparaison sort les deux sens — un objet sans
  test, et un test dont aucun objet ne porte le nom, ce qui attrape la faute de frappe dans un nom de
  fichier de test.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI du § 4.

1. **V4** — configuration `dependency-cruiser`, avec contre-épreuve
2. **V1** puis **V7** — première règle ESLint sur mesure, ce qui suppose de créer l'infrastructure
3. **V6 + existence des tests** — un seul script de complétude
4. **X5 signal** — puis le classement des trois cas, fichier par fichier
5. **V2** — après X5, avec la liste d'exclusion des identifiants portés

### Codemods

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **V1**, **V7** | oui | Passer un champ public en champ privé avec accesseur, et renommer les usages |
| **X5** cas 1 | oui, une fois le classement fait | Retirer l'affectation de l'objet et composer la clé dans le sérialiseur |
| **V3**, **V5** | non | Chaque cas demande de décider quelle règle valider, et où elle vit |

Un cas d'arrêt sur V1 : si un champ public est **écrit** depuis l'extérieur, le codemod ne peut pas le
privatiser sans casser. Il signale et s'arrête, il n'ajoute pas de mutateur.

---

## 7. Le type

Deux formes, et elles ne se valent pas.

**Type structurel** — léger, sans garantie d'unicité :

```ts
export type Threshold = { readonly value: number };
```

Deux types de même forme sont interchangeables : le typage structurel ne distingue pas un `Threshold`
d'un `Percentage`. C'est la forme retenue pour un read-model, dont la forme *est* le contenu — voir
`fiche-read-model.md`. Elle ne convient pas ici.

**Classe avec champ privé** — c'est ce qui donne la nominalité, parce qu'un champ `#` rend le type non
assignable depuis une forme identique :

```ts
export class Threshold {
  readonly #brand!: void;
  readonly value: number;
  constructor(value: number) { /* validation */ this.value = value; }
}
```

Forme retenue pour un objet-valeur : c'est la seule qui rende V3 et V8 vérifiables par le compilateur.
Un objet-valeur validé à la construction ne peut pas être un type structurel, puisque rien
n'obligerait à passer par le constructeur.

`readonly` est effacé à la compilation : il empêche l'écriture au typage, pas à l'exécution. V1 repose
sur les champs privés, pas sur `readonly`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Objet-valeur | **unitaire pur**, aucun double | la validation, le comportement, l'immuabilité |

L'existence du fichier de test se vérifie par comparaison de noms. Moyens et limites au § 6.

Deux indices de diagnostic, avec leurs bornes.

Un objet qui a besoin d'un double **viole V4**. Le double nécessaire est le symptôme, pas la cause.

Un objet-valeur dont le test unitaire n'a ni validation ni comportement à vérifier n'est probablement
pas un objet-valeur : appliquer le discriminant du § 1. La borne : un type nommé sans logique peut
valoir pour la seule signature, ce qu'admet le § 3.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, conformément au § 4.

Chaque ligne porte son statut au regard du § 6. `[auto]` disparaît de la checklist dès que la règle
correspondante existe. `[partiel]` reste, réduite à ce que la règle ne couvre pas. `[humain]` reste
entièrement : aucun moyen déterministe n'est identifié.

```
[ ] [humain]  V3  Validation à la construction, avant affectation, un seul type d'erreur   (objet-valeur)
[ ] [humain]  V5  La règle qui contraint la donnée est portée par l'objet                  (objet-valeur)
[ ] [auto]    V1  Aucun champ public ; aucune écriture après le constructeur, classe de base comprise
[ ] [partiel] V7  Aucune collection interne rendue telle quelle ; aucun gel inopérant
[ ] [auto]    V4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
[ ] [humain]  V8  Une intention d'écriture distincte a son propre type — et son motif tient (X7)
[ ] [auto]    V2  Aucune clé composée ici : une clé de cache se compose dans le sérialiseur
[ ] [partiel] V2  Aucune identité propre ; un identifiant porté est admis
[ ] [partiel] V6  Aucun repository, aucune persistance propre
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui de l'objet
[ ] [humain]  Tests unitaires purs, sans double
[ ] [humain]  Avant de signaler V3 ou V5, appliquer les tests du § 1 : est-ce un read-model ?
[ ] [humain]  Avant de signaler un id, classer la clé selon les trois cas du § 2, V2
```

À terme il reste six lignes, toutes de jugement : V3, V5, V8, la pureté des tests et les deux rappels
de classement. Les invariants les plus rentables de cette fiche — V3 et V5 — portent sur le contenu
d'une règle et non sur une forme syntaxique, ce qui borne la part automatisable.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **V1**, **V2**, **V6** immuabilité, absence d'identité, pas de cycle de vie | Evans, *DDD*, ch. « A Model Expressed in Software » — Value Object | *DDD Reference*, PDF gratuit |
| **V4** pureté | Evans, même ch. Martin, « The Clean Architecture » | les deux gratuits en ligne |
| **V5** comportement porté par l'objet | Fowler, « AnemicDomainModel » | bliki gratuit |
| **V3** validation à la construction | **convention Pix.** Cohérente avec l'invariant d'agrégat d'Evans sans être prescrite sous cette forme. Voir X3 au § 5 | — |
| **V7** exposition en lecture seule | **aucune source** — conséquence pratique de V1 | — |
| **V8** un type par intention | **aucune source.** Proche de Command et du DTO d'entrée, pas nommé ainsi | — |
| L'identité composite (deuxième et troisième cas de V2) | Evans, même ch. — l'identité d'une entité peut être composée de plusieurs attributs | *DDD Reference* |
| **X5** la clé de présentation appartient à la couche externe | Martin, *Clean Architecture* (2017), ch. « Presenters and Humble Objects » ; la règle de dépendance | le livre de 2017 |
| Le discriminant avec le read-model | la catégorie voisine n'a **aucun nom en DDD** — sources dans `fiche-read-model.md`, § 10. Les quatre tests du § 1 sont une construction de ce corpus, sans source | — |
| Validation à la frontière HTTP (X2) | **ADR 19**, qui écarte le typage des identifiants côté domaine pour son coût et retient la validation à la route. À réouvrir, pas à invoquer à l'appui du typage | ADR 19 |

Deux invariants sur huit n'ont aucune source : V7 et V8. V3 n'en a qu'une partielle. La catégorie
objet-valeur vient d'Evans ; la façon de l'appliquer ici est en partie conventionnelle. Ce sont des
conventions : elles se discutent sur leurs mérites, pas par appel à une autorité.

Les quatre tests du discriminant, au § 1, n'ont eux non plus aucune source. Ce sont les artefacts les
plus utilisés de la fiche et les moins adossés : à discuter sur leur rendement en revue, pas sur leur
pedigree.
