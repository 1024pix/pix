# Fiche — Entité

Fiche générique : elle décrit **l'état cible**, celui où l'architecture est rentable. Gabarit au § 10
de `fiche-repository.md`. L'écart avec le code est mesuré dans les **rapports de divergence**.

> **Brouillon pour relecture.** Le § 6 est le moins instruit : les taux de faux positifs sont estimés,
> pas mesurés. Et la frontière avec `fiche-racine-agregat.md` demande une passe conjointe — toute
> racine d'agrégat est une entité, l'inverse est faux.

---

## 1. Rôle

Une entité est définie **par son identité**, pas par ses attributs. Ses valeurs changent au cours du
temps, elle reste la même chose. C'est ce qui la distingue d'un objet-valeur, et c'est le seul
critère qui compte.

Elle porte les règles qui contraignent son propre état, et elle les tient **à tout instant** — pas
seulement à la construction.

**Le test de discrimination.** Si remplacer une instance par une autre portant exactement les mêmes
valeurs change quelque chose pour le métier, c'est une entité. Sinon, c'est un objet-valeur — voir
`fiche-objet-valeur.md`.

Deux exemples qui rendent le test concret : deux organisations aux mêmes nom et type sont deux
organisations différentes, donc entité. Deux seuils de 50 % sont le même seuil, donc objet-valeur.

### Entité ou racine d'agrégat ?

Toute racine d'agrégat est une entité. L'inverse est faux : une entité peut vivre **à l'intérieur**
d'un agrégat sans en être la racine, auquel cas elle n'est pas accessible directement et n'a pas de
repository.

La présente fiche couvre ce qui vaut pour **toute** entité. `fiche-racine-agregat.md` ajoute les
devoirs propres à la racine — frontière de cohérence, point d'entrée unique, repository.

En pratique, poser la question dans cet ordre : *cette entité est-elle atteignable autrement qu'en
passant par une autre ?* Si oui, c'est une racine.

### Ce qu'une entité n'est pas

| Le code… | Va dans |
| --- | --- |
| n'a pas d'identité propre, deux instances de mêmes valeurs sont interchangeables | un **objet-valeur** |
| est une projection de lecture sans comportement | un **read-model** |
| charge ou écrit des données | un repository |
| coordonne plusieurs entités et repositories pour réaliser une intention | `domain/usecases/` |
| met en forme pour une réponse HTTP | `infrastructure/serializers/` |
| décrit ce qu'on expose à un autre contexte | `application/api/` |

---

## 2. Écarts fréquents

| Écart | Comment le trancher |
| --- | --- |
| Constructeur en sac de propriétés, tous les champs optionnels, aucune validation | **dérive** — l'entité ne protège plus rien, elle est un objet littéral avec un nom |
| Tous les champs publics et assignables, aucune méthode | **dérive** — modèle anémique |
| Les règles vivent dans les usecases plutôt que sur l'entité | **dérive**, et elle se paie en duplication : la même règle réécrite différemment dans trois usecases |
| L'entité porte une méthode de sérialisation dont seul le repository se sert | **dérive**, sauf format publié — voir E5 |
| L'entité référence une autre entité par instance complète | **dérive** quand elles appartiennent à deux agrégats différents — voir E7 |
| Validation présente mais après affectation des champs | **incohérence de convention**, pas un bug |
| Une entité sans aucune règle propre | **à instruire** — c'est peut-être un read-model qui a hérité du mauvais dossier |

---

## 3. Le ROI de ces invariants

| Rentabilité | Invariants |
| --- | --- |
| **Forte** | **E3** — le gain principal, et de loin : un état invalide n'existe jamais, donc aucun code en aval n'a à s'en prémunir. C'est ce qui distingue un modèle qui protège d'un modèle qui décore. **E6** — sans lui, E3 n'est garanti qu'à la naissance, ce qui ne sert à rien |
| **Moyenne** | **E4** — rend les règles métier vérifiables en unitaire pur, à coût quasi nul. **E7** — borne le coût d'un chargement et garde la frontière déplaçable. **E5** — une migration de schéma ne touche pas au domaine. **E1** — préalable pour raisonner sur l'égalité et les références |
| **Hygiène** | **E2** — conséquence de E1 ; son apport se limite à des tests plus robustes. **E8** — nommage et emplacement |

Détail :

| Invariant | Ce qu'on gagne |
| --- | --- |
| **E1** identité explicite | On sait ce qui identifie l'objet sans lire la table. Condition nécessaire pour raisonner sur l'égalité, la déduplication et les références. |
| **E2** égalité par identité | Une comparaison ne dépend plus de l'ordre des champs ni de la fraîcheur des données chargées. |
| **E3** invariants tenus à tout instant | **Le gain principal.** Un état invalide n'existe jamais, donc aucun code en aval n'a à s'en prémunir. C'est ce qui fait la différence entre un modèle qui protège et un modèle qui décore. |
| **E4** pureté | Testable sans base ni mock, en unitaire pur. C'est ce qui rend les règles métier vérifiables à coût quasi nul. |
| **E5** pas de méthode de persistance | Une migration de schéma ne touche pas au domaine. |
| **E6** pas de mutateur nu | Chaque changement d'état passe par une méthode qui **nomme l'intention** et vérifie ce qu'elle doit vérifier. On lit l'entité et on connaît son cycle de vie. |
| **E7** référence par identité | Deux agrégats ne se chargent pas mutuellement. C'est ce qui borne le coût d'un chargement et évite les graphes d'objets qui tirent la moitié de la base. |

### Ce que ça n'apporte pas

Aucun de ces invariants ne dit si le concept modélisé est le bon, ni si la frontière entre deux
entités est au bon endroit. Ils garantissent qu'une entité tient ses promesses, pas qu'elle promet les
bonnes choses.

---

## 4. Invariants

### E1. L'identité est explicite et stable

L'entité porte son identifiant, et il ne change pas pendant sa vie.

```js
// conforme
class Organization {
  #id;
  constructor({ id, ... }) { this.#id = id; ... }
  get id() { return this.#id; }
}
```

**Cas de l'entité non encore persistée.** Une entité créée en mémoire n'a pas encore d'identifiant.
Deux traitements possibles, à choisir explicitement : un identifiant `null` assumé et documenté, ou un
type distinct pour l'intention de création (`…ForCreation`, voir `fiche-objet-valeur.md`, V8). La
seconde est plus sûre — la signature dit alors qu'il n'y a pas encore d'identité.

### E2. L'égalité se fonde sur l'identité

Deux instances de même identifiant sont la même entité, quelles que soient leurs valeurs. Deux
instances de mêmes valeurs et d'identifiants différents sont deux entités.

Conséquence pratique : ne pas comparer des entités par leurs champs dans les tests. Comparer les
identifiants, et vérifier séparément l'état pertinent.

### E3. Les invariants sont tenus à tout instant

C'est l'invariant qui distingue une entité d'un objet littéral nommé.

**À la construction :** une entité invalide ne s'instancie pas. Mêmes règles de cohérence que pour un
objet-valeur — valider avant d'affecter, un seul type d'erreur pour tout le domaine.

**À chaque changement d'état :** une méthode qui modifie l'entité vérifie que le nouvel état reste
valide. Sinon l'invariant n'est garanti qu'à la naissance, ce qui ne sert à rien.

```js
// fautif — l'invariant n'existe qu'au constructeur
archive() { this.archivedAt = new Date(); }

// conforme — la règle est vérifiée au moment où elle peut être violée
archive({ archivedBy, now }) {
  if (this.#archivedAt) throw new AlreadyArchivedError(this.#id);
  this.#archivedAt = now;
  this.#archivedBy = archivedBy;
}
```

**Le piège du constructeur en sac de propriétés.** Un constructeur déstructuré avec une valeur par
défaut `= {}` et tous les champs optionnels accepte l'objet vide. L'entité s'instancie toujours, donc
elle ne protège rien. C'est la forme la plus répandue de violation de E3, et la plus discrète : elle
ressemble à du code correct.

### E4. Aucune I/O, aucune dépendance à l'infrastructure

Le symptôme est dans les imports :

```js
// dans un fichier de domain/models/ — fautif
import { logger } from '../../../shared/infrastructure/utils/logger.js';
```

Vaut aussi pour l'horloge, l'aléatoire et la configuration. Une entité qui lit l'heure courante n'est
pas testable de façon déterministe : **la date entre en paramètre**, comme dans l'exemple de E3.

Corollaire : une entité ne charge jamais ce qui lui manque. Si une règle a besoin d'une donnée que
l'entité n'a pas, c'est au usecase de la fournir.

### E5. Aucune méthode au service de la persistance

La traduction vers la forme de stockage est la responsabilité du repository. L'entité n'expose pas de
méthode dont le repository est le seul consommateur.

**Exception nette :** quand la forme sérialisée est un **format publié** — écrit à la main, documenté,
consommé hors du code — la méthode de sérialisation sur le modèle exprime un contrat et non un schéma
de base. À distinguer explicitement, sinon on « corrige » un choix délibéré.

Le test qui discrimine : *si le schéma de la base changeait, cette méthode devrait-elle changer ?* Si
oui, elle est au service de la persistance. Si elle suit un format documenté indépendant, non.

### E6. Aucun mutateur nu

Un `set` public ou une affectation externe laisse l'appelant décider de l'état, donc annule E3.

Chaque changement d'état passe par une méthode qui **nomme l'intention métier** — `archive()`,
`complete()`, `rename()` — et non par un mutateur générique.

Bénéfice de lecture souvent sous-estimé : la liste des méthodes d'une entité est la liste des choses
qui peuvent lui arriver. C'est la documentation la moins chère de son cycle de vie.

**Cas de la construction progressive.** Une entité construite par une suite de mutateurs appelés de
l'extérieur (`setX()`, puis `setY()`, puis `setZ()`) n'est pas une entité mais un constructeur
déguisé, et son état est invalide entre deux appels. Si l'assemblage est vraiment progressif, le
nommer : un objet dédié à la construction, ou un read-model si l'objet ne porte aucune règle.

### E7. Les autres agrégats sont référencés par identité

Une entité ne tient pas l'instance complète d'une entité d'un **autre** agrégat : elle en tient
l'identifiant.

```js
// conforme
this.#organizationId = organizationId;

// à instruire — pourquoi cette entité a-t-elle besoin de l'objet entier ?
this.#organization = organization;
```

Deux raisons, et la seconde est la plus concrète :

- une frontière de cohérence ne s'étend pas à ce qu'elle ne contrôle pas ;
- charger l'objet entier oblige le repository à le charger aussi, et le coût d'un chargement cesse
  d'être borné.

À l'intérieur d'un même agrégat, tenir les instances est normal — c'est le sujet de
`fiche-racine-agregat.md`.

### E8. Nommage et emplacement

Un fichier par entité, nommé d'après le concept métier en PascalCase, dans `domain/models/`.

Le nom est celui du langage ubiquitaire du contexte. Deux contextes peuvent avoir une entité de même
nom désignant deux choses différentes : c'est attendu en DDD, pas une collision à résoudre. Ce qui
doit être clair, c'est **de quel contexte** on parle au moment de l'import.

---

## 5. Exceptions légitimes

| Cas | Statut |
| --- | --- |
| Une entité non persistée avec un identifiant `null` | **autorisé** si c'est assumé et documenté — voir E1 |
| Une entité sans aucune méthode de changement d'état | **autorisé** — toutes les entités ne mutent pas |
| Une entité tient les instances d'entités du **même** agrégat | **autorisé**, c'est la définition d'un agrégat |
| Une méthode de sérialisation vers un **format publié** | **autorisé**, c'est l'exception de E5 |
| Un accesseur calculé (`isArchived`, `hasFeature`) plutôt qu'un champ | **autorisé**, et souvent préférable |
| Une entité qui reçoit `now` ou un générateur en paramètre | **autorisé**, c'est la forme correcte de E4 |
| Deux contextes ont une entité de même nom | **autorisé**, c'est le langage ubiquitaire par contexte |
| Une entité au constructeur permissif dans du code ancien | **pas une exception** — c'est une dérive ou un vestige, à classer, pas à absoudre |

---

## 6. Vérification déterministe

*Section à instruire : les taux de faux positifs sont estimés, pas mesurés. Les deux règles les plus
utiles (E3, E6) sont aussi les plus susceptibles de produire du bruit sur l'existant.*

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| E4 | règle `dependency-cruiser` : `domain/models/**` ne dépend pas de `infrastructure/**` | configuration seule | aucun |
| E6 | règle ESLint : mutateur `set` public dans `domain/models/` | ~20 lignes | aucun attendu |
| E3 | règle ESLint : constructeur déstructuré avec `= {}` et sans appel de validation | ~40 lignes | **élevés sur l'existant** — à introduire en avertissement |
| E1 | règle ESLint : une classe de `domain/models/` expose un accesseur `id` | ~15 lignes | **à mesurer** |
| E8 | script `tests/tooling/` : nommage PascalCase, un fichier par entité | ~20 lignes | aucun |
| E2, E5, E7 | revue | — | — |

### E4 — configuration seule, la plus rentable

```js
{
  name: 'domain-model-must-not-import-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/domain/models/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

Piège habituel : `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas
atteints et **la règle ne se déclenche jamais sans le signaler**. Contre-épreuve obligatoire —
introduire la violation, confirmer que la règle sort, la retirer.

Cette règle est partagée avec `fiche-objet-valeur.md` (V4) et `fiche-specification.md` (S3) : une
seule règle couvre les trois.

### E6 — mutateur nu

Décidable localement : une déclaration `set nom(valeur)` dans un fichier de `domain/models/`, ou un
champ de classe public affecté hors du constructeur.

Le second motif est plus utile et plus délicat : il faut distinguer l'affectation dans le constructeur
de celle dans une méthode. Commencer par le cas net — `set` explicite — puis élargir.

### E3 — la règle la plus utile et la plus bruyante

Le motif : un constructeur dont le paramètre est déstructuré avec une valeur par défaut `= {}` et dont
le corps ne comporte aucun appel de validation.

Elle désigne exactement la forme dominante de violation. Mais elle sortira sur beaucoup d'entités
existantes, donc **à introduire en avertissement**, avec une décision préalable sur l'ampleur du
rattrapage. La lancer en erreur d'emblée garantit qu'elle sera désactivée.

### Ce qui n'est pas mécanisable

E2, E5 et E7 demandent de savoir ce qui appartient au même agrégat et ce qui est un format publié —
deux questions qui ne se lisent pas dans un fichier isolé.

### Codemods

Rentables sur E8 (renommage plus imports) et sur la privatisation des champs, comme pour les
objets-valeurs. Attention au même cas d'arrêt : si un champ public est **écrit** depuis l'extérieur,
le codemod signale et s'arrête au lieu d'ajouter un mutateur — qui violerait E6.

Non rentables sur E3 et E6 : ajouter une validation ou nommer une intention métier demande de savoir
quelle règle on protège.

---

## 7. En TypeScript

*Section à instruire conjointement avec `fiche-objet-valeur.md` § 7.*

Une entité se type naturellement en classe, ce qui pose moins de questions que pour un objet-valeur —
l'identité rend la nominalité moins critique, puisque deux entités ne se confondent pas par leur
forme.

```ts
export class Organization {
  readonly id: number;
  #archivedAt: Date | null;

  constructor(params: { id: number; archivedAt?: Date | null }) { /* validation */ }

  get isArchived(): boolean { return this.#archivedAt !== null; }
  archive(params: { archivedBy: number; now: Date }): void { /* … */ }
}
```

Deux bénéfices qui portent sur les invariants les plus souvent en défaut :

- **E3 devient partiellement structurel.** Des champs non optionnels dans le type du constructeur
  suppriment le sac de propriétés permissif : l'appelant ne peut plus omettre ce qui est requis. La
  validation de valeur reste nécessaire, mais la validation de présence est gratuite.
- **E7 devient lisible.** `organizationId: number` plutôt qu'`organization: Organization` est une
  différence visible dans le type, donc revue à la lecture de la signature.

**Contraintes de configuration :** `erasableSyntaxOnly` interdit `enum` et les propriétés de
constructeur — champs déclarés explicitement, énumérations en objets `as const`.

**Le blocage habituel :** `declare module '*.js'` donne `any` à tout import d'un `.js`. Une entité en
`.ts` qui importe ses erreurs ou ses objets-valeurs depuis des `.js` ne vérifie rien de ces imports.
Ordre imposé : les objets-valeurs et les erreurs d'abord, les entités ensuite.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Entité | **unitaire pur**, aucune base, aucun mock | la validation à la construction, les règles de chaque changement d'état |
| Chaque méthode de changement d'état | **unitaire** | le cas passant **et** le refus quand l'invariant serait violé |
| Accesseurs calculés | **unitaire** | les cas limites, pas seulement le cas nominal |

Le test qui manque le plus souvent est celui du **refus** : on vérifie qu'`archive()` archive, pas
qu'il refuse d'archiver deux fois. Or c'est ce second test qui prouve que E3 est tenu.

Corollaire de diagnostic : **une entité qui a besoin d'un mock pour être testée viole E4.**

---

## 9. Checklist de revue

```
[ ] E3  L'entité refuse de s'instancier dans un état invalide, et refuse chaque transition invalide
[ ] E6  Aucun mutateur nu ; chaque changement d'état nomme son intention métier
[ ] E4  Aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration
[ ] E1  L'identité est explicite et ne change pas ; le cas non persisté est traité
[ ] E7  Les entités d'un autre agrégat sont référencées par identifiant, pas par instance
[ ] E5  Aucune méthode dont le repository est le seul consommateur    (sauf format publié)
[ ] E2  Les comparaisons se fondent sur l'identité, pas sur les champs
[ ] E8  Un fichier, PascalCase, nom du langage ubiquitaire du contexte
[ ] Tests unitaires purs ; chaque règle a son test de refus, pas seulement son cas passant
[ ] Si l'entité n'a aucune règle propre, vérifier que ce n'est pas un read-model mal rangé
```

---

## 10. Sources

Bibliographie dans `references-ddd.md`.

| Invariant | Source |
| --- | --- |
| **E1, E2** identité, égalité par identité | Evans, *DDD*, ch. « A Model Expressed in Software » — Entity. *DDD Reference*, PDF gratuit |
| **E3** invariants tenus à tout instant | Evans, ch. « The Life Cycle of a Domain Object » — l'invariant est la raison d'être de l'agrégat, et vaut pour l'entité |
| **E4** pureté | Evans, même ch. ; Martin, « The Clean Architecture » — billet gratuit |
| **E5** pas de méthode de persistance | Evans, ch. « A Model Expressed in Software ». L'exception du format publié : ch. « Maintaining Model Integrity », **Published Language** |
| **E6** pas de mutateur nu | Fowler, « AnemicDomainModel » — gratuit en ligne |
| **E7** référence par identité | Vernon, « Effective Aggregate Design » — trois articles gratuits. C'est l'une de ses quatre règles |
| **E8** nommage et emplacement | **convention Pix**, cohérente avec ADR 51 |
| **Le test de discrimination** entité / objet-valeur | Evans, même ch. — c'est le critère qu'il donne |

**Un seul invariant sur huit n'a aucune source externe** (E8, convention). C'est la fiche la mieux
adossée du corpus : la catégorie entité est le cœur du vocabulaire tactique de DDD, et ses invariants
sont ceux des livres.

À l'inverse, ce qui manque de source ici, c'est la **façon Pix** de les appliquer — le choix du type
d'erreur de validation, l'ordre validation/affectation, le traitement de l'entité non persistée. Ces
trois points relèvent de la convention et se discutent sur leurs mérites.
