# Fiche — Specification

Fiche générique : elle décrit **l'état cible**, celui où l'architecture est rentable. Suit le gabarit
défini au § 10 de `fiche-repository.md`.

L'écart avec le code réel est mesuré dans les **rapports de divergence**, un par contexte. Voir
`rapport-divergence-quest.md`.

À utiliser dès qu'un objet répond à la question « ce candidat satisfait-il ces critères ? » :
un moteur de règles, un ensemble de pré-requis, un prédicat métier composable et configuré par des
données.

---

## 1. Rôle

Une Specification porte un **prédicat sur un autre objet**. Elle ne fait rien d'autre : elle ne
charge pas, elle n'écrit pas, elle ne décide pas des conséquences.

Le pattern se décline en quatre éléments, et les nommer évite les trois quarts des confusions :

| Élément | Rôle | Où il vit |
| --- | --- | --- |
| **La specification** | l'arbre de critères. Racine d'agrégat si elle est persistée et identifiée | `domain/models/<famille>/entities/` |
| **Les critères** | les feuilles et les combinateurs du prédicat. Objets-valeurs | `domain/models/<famille>/value-objects/` |
| **Le candidat** | l'objet évalué, assemblé pour l'occasion. **Read-model, pas agrégat** | un dossier qui dit ce qu'il est — pas `aggregates/` |
| **`isSatisfiedBy(candidat)`** | l'unique point d'entrée | sur la specification |

Une specification peut porter **plusieurs prédicats indépendants** sur le même candidat, quand le
métier distingue plusieurs questions — par exemple « cet utilisateur est-il concerné ? » et
« a-t-il accompli ce qui est demandé ? ». Chaque prédicat est un arbre distinct, évalué séparément.

Un prédicat **vide** est vrai par vacuité : une composition `all` sur une liste vide renvoie `true`.
Ce n'est pas un bug, c'est la sémantique attendue — mais il faut le savoir, parce qu'un prédicat vide
ne cadre plus rien.

### Ce qu'une Specification n'est pas

| Le code… | Va dans |
| --- | --- |
| charge les données du candidat | un repository, puis un usecase qui assemble le candidat |
| décide quoi faire du résultat | `domain/usecases/` |
| journalise, mesure, trace | l'appelant — voir S3 |
| filtre les critères avant d'évaluer | nulle part : c'est S8 |
| enrichit le candidat en cours d'évaluation | le usecase, avant l'appel |

### Le format d'une specification pilotée par les données est un contrat publié

Dès qu'une specification est **écrite à la main** — JSON en base, CSV d'import, interface
d'administration — son format devient un **Published Language** au sens d'Evans. Trois conséquences
qui ne se négocient pas :

- ses clés ne se renomment pas pour des raisons de style interne, même si elles jurent avec les
  conventions du code ;
- toute valeur ajoutée à une énumération du format est documentée avant d'être utilisable ;
- un format publié se versionne ou s'étend, il ne se casse pas.

---

## 2. Écarts fréquents avec le pattern

Ce que la théorie prescrit, et les manières habituelles de s'en écarter. Chaque écart se juge sur la
grille coût/bénéfice de `invariants-clean-archi-ddd.md`, et se classe en **convention**, **dérive**
ou **vestige**.

| Écart | Pourquoi il arrive | Ce qu'il coûte |
| --- | --- | --- |
| La specification lève au lieu de rendre `false` sur un candidat incomplet | le candidat est toujours complet dans les tests écrits | l'erreur remonte dans un job, souvent avalée par un `try/catch` |
| « Non satisfait » et « non évaluable » confondus | il est plus rapide de journaliser et de rendre `false` | une specification cassée est indiscernable d'un candidat qui ne remplit pas les critères |
| La specification journalise | c'est un moteur difficile à déboguer | le domaine dépend de l'infrastructure, et le coût d'évaluation devient variable |
| Un consommateur reconstruit la specification | il a besoin d'une sémantique légèrement différente | aucune API publiée ne peut couvrir cet usage : le découpage en contextes devient impossible |
| Le candidat est rangé avec les agrégats | il porte un nom métier et vit près d'eux | le mot « agrégat » promet une garantie inexistante |
| La résolution d'une propriété du candidat se fait par nom, tardivement | c'est ce qui rend le format extensible sans toucher au moteur | rien ne garantit que le nom corresponde à quelque chose — voir S7 |

---

## 3. Le ROI de ces invariants

| Rentabilité | Invariants |
| --- | --- |
| **Forte** | **S1** — une specification mal câblée devient un test rouge au lieu d'une exception avalée dans un job. **S2** — sans lui, un utilisateur privé de son résultat par un défaut est indiscernable d'un utilisateur qui n'y a pas droit. **S6** — casser le format publié casse les specifications déjà écrites. **S8** — c'est le préalable à toute API publiée du moteur, donc à sa réutilisation |
| **Moyenne** | **S3** — testabilité sans mock et coût d'évaluation prévisible, décisif dès qu'on évalue en boucle. **S4** — rend cache et chargement paresseux possibles sans surprise. **S7** — interdit une classe de pannes silencieuses pour dix lignes de test |
| **Hygiène** | **S5** — généralement déjà tenu, donc rien à gagner : à **protéger**, pas à conquérir. **S9** — la cohérence de forme (type d'erreur unique, ordre validation/affectation) ne prévient aucun bug observable |

Détail :

| Invariant | Ce qu'on gagne |
| --- | --- |
| **S1** totalité | Une specification mal câblée devient un test rouge au lieu d'une exception dans un job asynchrone que personne ne regarde. |
| **S2** non satisfait ≠ non évaluable | On distingue « le candidat ne remplit pas les critères » de « la specification est cassée ». Sans ça, un utilisateur privé de son résultat à cause d'un défaut est indiscernable d'un utilisateur qui n'y a pas droit. |
| **S3** pureté | Rejouable et testable sans mock, et coût d'évaluation prévisible. Décisif dès que la specification est évaluée en boucle sur beaucoup de candidats. |
| **S4** immuabilité des critères | Un arbre partagé entre évaluations ne peut pas être modifié par un appelant. C'est ce qui rend le cache, le chargement paresseux et l'évaluation concurrente possibles sans surprise. |
| **S5** fermeture par composition | Exprimer une condition métier arbitraire sans toucher au moteur. C'est la raison d'être du pattern. |
| **S6** format publié | Les specifications déjà écrites continuent de fonctionner, et leur documentation reste vraie. |
| **S7** correspondance format ↔ candidat | Rend impossible le scénario « on enregistre un critère, on oublie de brancher la donnée, la specification n'aboutit jamais ». |
| **S8** pas de redéfinition par le consommateur | C'est le **préalable à toute API publiée** du moteur, donc à sa réutilisation par un autre contexte. |
| **S9** validation à la construction | Une specification invalide n'existe pas. L'évaluation n'a rien à vérifier, donc rien à décider. |

### Ce que ça n'apporte pas

Aucun de ces invariants ne dit si les critères d'une specification donnée sont **les bons**, ni si les
identifiants qu'elle référence existent. La cohérence référentielle d'un format piloté par les données
est un sujet distinct, à traiter à l'écriture — pas à l'évaluation.

---

## 4. Invariants

### S1. La specification est totale

`isSatisfiedBy` est définie pour **tout** candidat, y compris incomplet. Une donnée absente rend
`false`, jamais une exception.

Le point sensible est toujours le même : l'accès à une propriété du candidat.

```js
// fautif — lève si la propriété est absente
check(item) {
  const value = item[this.#key];
```

Et le candidat doit être total lui aussi. Deux formes le garantissent :

```js
// une projection : la propriété est toujours un objet, ses champs peuvent être undefined
this.learner = { id: learner?.id };

// une valeur par défaut : la collection est toujours itérable
constructor({ items = [] }) { this.items = items; }
```

À éviter absolument : **plusieurs modes de réponse pour la même erreur de câblage**, selon la
propriété touchée. Si certaines propriétés lèvent, d'autres rendent `false` par projection et
d'autres `false` par collection vide, le diagnostic devient impossible et le comportement dépend du
critère écrit.

### S2. « Non satisfait » et « non évaluable » sont distincts

Une specification renvoie un booléen quand elle a pu conclure, et **signale explicitement** qu'elle
n'a pas pu conclure.

```js
// fautif — journalise puis renvoie false : indiscernable d'un candidat non conforme
if (comparisonIsInvalid) {
  logger.error(...);
  return false;
}
```

Une comparaison malformée, un type inconnu, une donnée d'un type inattendu ne sont pas des réponses
négatives. Trois sorties possibles, à choisir explicitement : lever une erreur du domaine, renvoyer
un résultat à trois états, ou renvoyer un booléen accompagné d'une liste de diagnostics.

### S3. La specification est pure

Aucune I/O, aucun effet de bord, aucune dépendance à l'infrastructure. Le candidat entre, un booléen
sort.

En pratique, l'entorse est presque toujours la journalisation, et son symptôme est visible dans les
imports :

```js
// dans un fichier de domain/models/ — fautif
import { logger } from '../../../shared/infrastructure/utils/logger.js';
```

**La sortie propre n'est pas de supprimer la trace**, qui est utile sur un moteur difficile à
déboguer : c'est de la **rendre à l'appelant**. Une évaluation qui renvoie son résultat accompagné de
sa trace laisse l'appelant décider quoi en faire, et la specification reste pure.

### S4. Les critères sont immuables et sans identité

Les composants du prédicat sont des objets-valeurs : état privé, exposition en lecture seule, aucune
identité, aucun repository.

Deux pièges récurrents :

```js
// un champ public sur une classe de base — modifiable de l'extérieur malgré le reste
class BaseCriterion {
  type;
  comparison;
}
```

```js
// un Object.freeze qui ne protège rien : les champs #private ne sont pas des propriétés,
// et le getter reconstruit un objet neuf, non gelé, à chaque appel
get data() {
  return Object.freeze(this.#inner).data;
}
```

Le second est plus coûteux que l'absence de protection, parce qu'il en donne l'apparence.

### S5. La composition est fermée

Un combinateur accepte n'importe quel critère comme enfant, y compris un autre combinateur, et
propage le candidat **sans le transformer**.

C'est ce qui permet d'exprimer une condition métier arbitraire sans modifier le moteur. À protéger :
un combinateur qui refuse un type d'enfant, ou qui modifie le candidat avant de le passer, casse la
propriété.

### S6. Le format est un contrat publié

Voir § 1. L'invariant opérationnel : toute valeur ajoutée à une énumération du format est documentée
**avant** d'être utilisable, et aucune clé existante n'est renommée.

Le tiers état est le vrai danger : une valeur qui existe dans le code sans être documentée. Ceux qui
écrivent des specifications ne peuvent pas s'en servir, et ceux qui lisent le code ne savent pas si
elle est supportée. Soit la documentation rattrape, soit le code retire.

### S7. Tout critère déclaré est branché sur le candidat

Quand la résolution d'une propriété du candidat se fait **par nom**, l'énumération des noms
autorisés et la surface du candidat forment un contrat implicite. Il doit être vérifié.

Le protocole d'ajout d'un critère comporte typiquement plusieurs étapes dans plusieurs fichiers :
exposer la propriété sur le candidat, enregistrer le nom dans l'énumération, charger la donnée dans
le repository qui assemble le candidat. **Seule l'étape d'enregistrement est généralement validée**,
par le schéma du format. Les autres ne le sont par rien.

Un nom enregistré sans donnée derrière produit S1 : selon la forme de la propriété, une exception ou
un `false` définitif et silencieux.

**Exception à prévoir.** Un critère qui porte un algorithme — un calcul, un seuil, une agrégation —
n'utilise pas la résolution par nom mais appelle une méthode nommée du candidat. Il sort du périmètre
de S7 et n'entre pas dans l'énumération. Le distinguer explicitement, sinon la vérification produit
un faux positif.

### S8. Un consommateur ne redéfinit pas la specification

Un consommateur **évalue** une specification, ou n'en fait rien. Il ne choisit pas quels critères
comptent.

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

Le troisième est rédhibitoire : aucune API publiée ne peut exposer « réinstancie mon agrégat avec
d'autres critères ». **Tant que S8 est violé, le moteur ne peut pas devenir un contexte borné
distinct de ses consommateurs.**

Le besoin métier derrière est souvent légitime — un critère qui ne doit pas bloquer dans certaines
conditions. Mais il doit devenir une **propriété explicite** du modèle du consommateur, au lieu d'un
filtrage de critères au moment d'évaluer.

**Chemin de sortie.** Une couche de traduction unique entre le vocabulaire du consommateur et le
format de la specification, dans les deux sens. Elle doit couvrir **l'écriture et la lecture** : une
traduction qui ne sert qu'à créer la specification laisse le chemin de lecture accéder au format en
direct, et le couplage reste entier.

### S9. La validation a lieu à la construction

Une specification invalide ne s'instancie pas. L'évaluation ne valide rien.

Valable à **tous les niveaux** de l'arbre : la specification, les combinateurs, les critères, les
comparaisons élémentaires. Chacun avec son schéma.

Deux points de cohérence à tenir, sans quoi l'invariant est respecté sans être utile :

- **un seul type d'erreur de validation** pour tout l'arbre, sinon les appelants rattrapent et
  reconvertissent ;
- **valider avant d'affecter les champs**, pas après sur `this` — sinon un objet invalide existe le
  temps de son constructeur, et le message d'erreur porte sur un état déjà construit.

---

## 5. Exceptions légitimes

Sans cette section, un relecteur — humain ou agent — signale du code correct.

| Cas | Statut |
| --- | --- |
| Un prédicat vide est vrai par vacuité | **autorisé**, c'est la sémantique de la composition `all`. Effet à connaître : plus de cadrage du candidat |
| Un critère algorithmique hors de l'énumération des noms, appelant une méthode du candidat | **autorisé**, hors périmètre de S7 |
| Un critère sans modalité de comparaison, quand la notion n'a pas de sens pour lui | **autorisé** — un seuil ne se compare pas « une parmi » |
| Une méthode du candidat qui rend une valeur neutre sur entrée non exploitable | **autorisé**, et c'est S1 bien appliqué |
| Un candidat construit **en deux temps**, avec un setter pour la partie coûteuse à charger | **autorisé** si l'appelant renseigne avant usage. C'est une optimisation, pas une violation de S1 — mais à documenter, sinon un relecteur la corrigera |
| Une specification aux prédicats **tous** vides | **cas dégénéré**, pas une exception. Elle est satisfaite par tout candidat. À interdire à l'écriture, pas à l'évaluation |

---

## 6. Vérification déterministe

**La conclusion diffère de la fiche repository, et c'est le point important.** Là où un repository
demande des règles ESLint sur mesure, une specification se vérifie surtout par des **tests** — parce
que son domaine est **énumérable** : la liste des types de critères, celle des comparaisons, la
surface du candidat. On boucle dessus et on affirme une propriété, ce qui est plus simple et plus
robuste qu'une analyse d'AST.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **S7** | test de correspondance énumération ↔ surface du candidat | ~10 lignes | aucun |
| **S1** | test de totalité paramétré sur les énumérations | ~30 lignes | aucun |
| **S3** | règle `dependency-cruiser` : `domain/models/**` ne dépend pas de `infrastructure/**` | configuration seule | aucun |
| **S4** | règle ESLint : aucun champ public mutable dans `value-objects/` ; `Object.freeze` inopérant | ~30 lignes | faibles |
| **S6** | test comparant les énumérations à une documentation versionnée | ~15 lignes | dépend d'une doc dans le dépôt |
| **S5** | test de composition : un combinateur accepte chaque type d'enfant, imbrication comprise | ~20 lignes | aucun |
| **S2**, **S9** | revue | — | — |
| **S8** | règle `dependency-cruiser`, **après** le découpage | configuration | — |

### S7 — le test le plus rentable

```js
for (const name of Object.values(CRITERION_NAMES)) {
  expect(Object.getOwnPropertyNames(Candidate.prototype)).to.include(name);
}
```

Dix lignes, zéro faux positif. Il verrouille l'étape du protocole d'ajout que rien ne protège. S'il
passe déjà, c'est un test de non-régression — et c'est très bien : il coûte dix lignes et interdit
une classe entière de pannes silencieuses.

Extension plus coûteuse mais utile : vérifier que la propriété est **renseignée** par le repository
qui assemble le candidat, pas seulement exposée. Demande une fixture, donc un test d'intégration.

### S1 — test de totalité

```js
const empty = new Candidate({});
for (const name of Object.values(CRITERION_NAMES)) {
  const criterion = buildCriterion({ name, /* … */ });
  expect(() => criterion.isSatisfiedBy(empty)).to.not.throw();
}
```

À étendre à chaque valeur de l'énumération des comparaisons, et à un candidat dont chaque propriété
est absente à tour de rôle.

**Ne pas l'étendre** aux parties du candidat volontairement chargées en deux temps — voir § 5.

### S3 — configuration seule

```js
{
  name: 'domain-model-must-not-import-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/domain/models/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

Piège d'implémentation, valable pour toutes les règles de ce type : écrire `src/.+/` et non
`src/[^/]+/`, sinon les contextes à sous-contextes ne sont pas atteints et **la règle ne se déclenche
jamais, sans erreur ni avertissement**. Vérifier par contre-épreuve avant de committer : introduire
la violation, confirmer que la règle sort, retirer la violation.

### S4 — deux motifs syntaxiques

Décidable sans quitter le fichier :

- dans un fichier de `value-objects/`, une déclaration de champ de classe sans `#` ;
- un `Object.freeze(x)` dont la cible n'a que des champs privés, ou dont le résultat n'est pas la
  valeur renvoyée.

### Ce qui n'est pas mécanisable

S2 et S9 demandent de juger si une distinction sémantique est faite au bon endroit. S8 est un
chantier de conception : la règle qui l'interdirait ne peut être écrite qu'une fois le découpage
réalisé — elle en est la conséquence, pas le moyen.

### Codemods

Peu rentables ici, contrairement à la fiche repository. Les corrections de S1, S2 et S3 demandent
chacune une décision — quelle valeur par défaut, quel canal pour signaler l'inévaluable, que devient
la trace — et S4 porte sur peu de fichiers. Le test et la règle suffisent.

---

## 7. La specification en TypeScript

Le pattern se type bien, et c'est un bon candidat de migration : peu de fichiers, aucune I/O,
frontière nette.

```ts
export type Candidate = {
  readonly learner?: { id: number };
  readonly items: readonly Item[];
};

export type Specification<C> = {
  isSatisfiedBy(candidate: C): boolean;
};
```

Deux bénéfices immédiats, et ils portent précisément sur les invariants les plus souvent en défaut :

- **S1 devient structurel.** Un candidat aux propriétés optionnelles force le traitement de l'absence
  à la compilation. Sous `strict`, un accès non gardé ne compile plus.
- **S7 devient structurel.** Le nom d'un critère typé en `keyof Candidate` plutôt qu'en `string` rend
  impossible la déclaration d'un critère sans propriété correspondante. Le test de S7 devient inutile.

**Deux contraintes de la configuration en place :**

- `erasableSyntaxOnly` interdit `enum` — les énumérations restent des objets `as const`.
- `declare module '*.js'` donne le type `any` à tout import d'un `.js`. Une specification en `.ts` qui
  importe ses modèles depuis des `.js` **ne vérifie rien**. Ordre imposé : les modèles partagés
  d'abord, la specification ensuite.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Specification, combinateurs, critères, comparaisons | **unitaire pur** — aucune base, aucun mock | la logique de composition et de comparaison |
| Totalité et modes d'échec | **unitaire paramétré** sur les énumérations | S1 et S2, en énumérant plutôt qu'en listant des cas |
| Le candidat et ses valeurs par défaut | **unitaire** | l'assemblage, et la forme garantie de chaque propriété |
| Correspondance énumération ↔ candidat | **unitaire** | S7 |
| Les repositories qui assemblent le candidat | **intégration** | que chaque propriété est effectivement renseignée |

Corollaire de diagnostic : **une specification qui a besoin d'un mock pour être testée en unitaire
viole S3.** Le mock nécessaire est le symptôme, pas la solution.

---

## 9. Checklist de revue

Ordonnée par gravité décroissante.

```
[ ] S8  Aucun consommateur ne filtre les critères ni ne reconstruit la specification
[ ] S1  Aucun accès à une propriété du candidat sans traiter son absence
[ ] S2  Une comparaison qui ne peut pas conclure le signale, elle ne renvoie pas false
[ ] S3  Aucun import d'infrastructure dans un modèle du domaine, logger compris
[ ] S7  Tout critère ajouté à l'énumération a sa propriété sur le candidat ET son chargement
[ ] S4  Aucun champ public mutable ; aucun Object.freeze qui ne protège rien
[ ] S6  Toute valeur ajoutée à une énumération du format est documentée
[ ] S9  Validation à la construction, un seul type d'erreur, avant affectation des champs
[ ] S5  La composition reste fermée ; le candidat n'est pas transformé en cours de route
[ ] Tests unitaires purs, sans mock ; les tests énumèrent au lieu de lister des cas
[ ] Avant de signaler S1 ou S7, vérifier les exceptions du § 5
```

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| **Le cadrage** — c'est une Specification, pas un modèle ordinaire | Evans, *DDD*, ch. « Making Implicit Concepts Explicit » | Evans & Fowler, PDF gratuit |
| **S1** totalité | Evans & Fowler, « Specifications » | <https://martinfowler.com/apsupp/spec.pdf> |
| **S2** non satisfait ≠ non évaluable | **aucune source.** Déduction à partir de S1 : les sources ne traitent pas le cas d'une specification non évaluable | — |
| **S3** pureté | Evans, *DDD*, ch. « A Model Expressed in Software » — le Service de domaine y est défini sans état ni I/O | *DDD Reference*, PDF gratuit |
| **S4** immuabilité, absence d'identité | Evans, *DDD*, même chapitre — Value Object | *DDD Reference* |
| **S5** fermeture par composition | Evans & Fowler, « Specifications » — la composition y est explicite | même PDF |
| **S6** format publié | Evans, *DDD*, ch. « Maintaining Model Integrity » — **Published Language** | *DDD Reference* |
| **S7** énumération ↔ candidat | **aucune source.** Contrainte propre à la résolution tardive par nom | — |
| **S8** pas de redéfinition par le consommateur | Evans, même ch. — **Anticorruption Layer**, **Bounded Context** ; Pix : **ADR 55** | ADR 55 dans le dépôt ; Vernon, *IDDD*, ch. « Integrating Bounded Contexts » |
| **S9** validation à la construction | **convention Pix.** Cohérente avec l'invariant d'agrégat d'Evans, pas prescrite sous cette forme. Voir ADR 31 pour la validation des chaînes | — |

**Trois invariants sur neuf n'ont aucune source** (S2, S7, S9). Ils se discutent sur leurs mérites,
pas par appel à une autorité.

Le cadrage lui-même est l'affirmation la plus structurante de la fiche : si un objet n'est pas une
Specification, tout ce qui précède change de nature. Le PDF gratuit d'Evans & Fowler suffit à en
juger, et c'est là qu'il faut commencer pour contester la fiche.
