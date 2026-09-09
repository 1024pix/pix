# Fiche — Usecase

Fiche générique : elle décrit **l'état cible**, celui où l'architecture est rentable. Gabarit au § 10
de `fiche-repository.md`. L'écart avec le code est mesuré dans les **rapports de divergence**.

**Le service de domaine a désormais sa propre fiche** : `fiche-service-domaine.md`. Le regroupement
initial — « le code ne fait pas la distinction, donc une seule fiche » — était incohérent avec le
reste du corpus : c'est justement parce que la catégorie est presque vide qu'une fiche est utile, elle
donne le critère pour juger. Même raisonnement que pour la racine d'agrégat.

Ce qu'il faut retenir ici : **un fichier de `domain/services/` qui reçoit un repository est un
usecase**, et tous les invariants ci-dessous s'y appliquent sans exception. Le test tient dans la
signature. Voir § 4bis.

> **Brouillon pour relecture.** Le § 6 est le moins instruit. Et U7 (périmètre transactionnel) demande
> une passe conjointe avec les ADR 9 et 25, que je n'ai pas lus intégralement.

---

## 1. Rôle

Un usecase réalise **une intention métier** de bout en bout. Il orchestre : il appelle des
repositories, construit ou fait évoluer des objets du domaine, et décide de l'ordre des opérations.

Il ne calcule aucune règle lui-même. Les règles vivent sur les entités, les objets-valeurs et les
racines d'agrégat ; le usecase les fait jouer dans le bon ordre, avec les bonnes données.

C'est la couche la plus lue du contexte : on ouvre un usecase pour comprendre ce que le système fait.
Sa qualité de lecture compte donc autant que sa correction.

### Ce qu'un usecase n'est pas

| Le code… | Va dans |
| --- | --- |
| applique une règle sur des objets d'une même frontière de cohérence | **la racine d'agrégat** |
| contraint une valeur | un **objet-valeur** |
| accède à une source de données | un **repository** |
| lit une requête HTTP, choisit un code de retour, sérialise | `application/` — contrôleur, route, sérialiseur |
| expose une capacité à un autre contexte | `application/api/` |
| met en forme des données pour une lecture | un **read-model**, construit par un repository |

Repère pratique : un usecase ne contient **aucun calcul métier**. Un `if` sur « l'objet a-t-il été
trouvé » est légitime ; un `if` sur une condition métier signifie qu'une règle a fui hors du modèle.

---

## 2. Écarts fréquents

| Écart | Comment le trancher |
| --- | --- |
| La règle métier est dans le usecase plutôt que sur l'entité | **dérive**, la plus coûteuse : la même règle finit réécrite différemment dans plusieurs usecases |
| Le usecase reçoit ses dépendances mélangées à ses entrées métier dans un seul objet | **convention assumée**, décidée en ADR 46 — mais elle rend la frontière du usecase illisible |
| Le fichier de câblage des usecases importe l'infrastructure | souvent un **vestige** d'une architecture en couches unique répliquée par contexte |
| Le usecase renvoie un objet façonné pour la réponse HTTP | **dérive** — la couche application est censée s'en charger |
| Un « service » de `domain/services/` appelle des repositories | **dérive de vocabulaire** — c'est un usecase, voir § 4bis |
| Le usecase appelle directement le domaine d'un autre contexte | **dérive** — ADR 55 impose l'API interne |
| Un usecase réduit à un seul appel de repository | **convention assumée**, décidée en ADR 20 |

---

## 3. Le ROI de ces invariants

| Rentabilité | Invariants |
| --- | --- |
| **Forte** | **U1** — le plus rentable et le plus violé : la règle est écrite **une fois**, là où sont ses données, au lieu d'être réécrite en trois variantes divergentes. **U9** — garde les contextes découplés et le contrat entre eux explicite |
| **Moyenne** | **U2**, **U3** — testabilité (indispensable sous ESM) et indépendance de la couche métier. **U4** — la liste des fichiers est la documentation fonctionnelle du contexte, et elle est gratuite. **U5**, **U6** — le même usecase sert une route, un script et un job sans adaptation. **U7** — on sait ce qui est atomique |
| **Hygiène** | **U8** — enregistrement dans l'index. Aucun effet à l'exécution ; garde l'index exhaustif pour la lecture d'ensemble |

Détail :

| Invariant | Ce qu'on gagne |
| --- | --- |
| **U1** aucune règle métier | La règle est écrite une fois, là où sont ses données. C'est ce qui empêche trois usecases d'implémenter trois variantes de la même condition. |
| **U2** dépendances injectées | Le usecase est testable en substituant ses dépendances — indispensable sous ESM, où les exports sont immuables et ne peuvent pas être remplacés autrement. |
| **U3** aucun import d'infrastructure | La couche métier reste indépendante de la façon dont les données sont stockées ou atteintes. |
| **U4** une intention, un nom | La liste des fichiers de `usecases/` est la liste de ce que le contexte sait faire. C'est la meilleure documentation fonctionnelle disponible, et elle est gratuite. |
| **U5 / U6** aucune notion de transport | Le même usecase sert une route HTTP, un script et un job sans adaptation. |
| **U7** périmètre transactionnel explicite | On sait ce qui est atomique. Sans cette réponse, chaque écriture multiple est un pari. |
| **U8** enregistré dans l'index | L'index reste la carte de ce que le contexte sait faire, et le point unique où ses dépendances sont visibles. |
| **U9** pas d'accès direct au domaine voisin | Les contextes restent découplés, et le contrat entre eux reste explicite. |

### Ce que ça n'apporte pas

Ces invariants ne disent pas si le découpage en usecases est le bon, ni si une intention métier
mérite son usecase. Un usecase par route est une convention, pas une garantie de pertinence : elle
produit aussi des usecases qui ne font que déléguer.

---

## 4. Invariants

### U1. Aucune règle métier dans le usecase

C'est l'invariant central, et le plus souvent violé.

```js
// fautif — la règle « un parcours archivé n'accepte plus de participation » vit ici,
// donc elle sera réécrite ailleurs
if (course.archivedAt !== null) {
  throw new CourseArchivedError();
}
await participationRepository.save({ ... });

// conforme — la règle est sur l'objet qui la porte
course.addParticipation({ learnerId });
await courseRepository.save({ course });
```

**Comment discriminer.** Un `if` qui teste l'existence d'un résultat de chargement est de
l'orchestration. Un `if` qui teste une propriété métier d'un objet du domaine est une règle : elle
appartient à cet objet.

Bénéfice indirect : un usecase sans règle est presque toujours testable en lisant sa suite d'appels.
S'il faut dérouler mentalement des conditions pour comprendre ce qu'il fait, U1 est probablement
violé.

### U2. Les dépendances arrivent en paramètres, jamais par import

Un usecase n'importe pas de repository, ni de client, ni d'API interne. Il les reçoit, et le câblage
a lieu dans l'index du contexte.

```js
// conforme
export async function startCourse({ userId, code, courseRepository, participationRepository }) { … }
```

**Le motif technique, et il est daté.** Sous ESM les exports sont immuables : un module importé ne
peut pas être substitué par une doublure de test. L'injection n'est donc pas une préférence de style
mais la seule façon de tester le composant isolément. C'est ce que décide l'ADR 46.

**Limite connue de la forme actuelle.** Dépendances et entrées métier sont mélangées dans un seul
objet déstructuré, donc rien ne les distingue dans la signature. C'est une convention assumée, dont
la correction éventuelle — deux objets de paramètres — est discutée au § 7 de `fiche-repository.md`.

### U3. Aucun import d'infrastructure

Corollaire de U2 côté fichier : un usecase n'importe rien de `infrastructure/`, ni du sien ni de celui
d'un autre contexte.

L'exception apparente est le **fichier de câblage** — `domain/usecases/index.js` — qui importe par
définition ce qu'il injecte. Sa présence dans `domain/` est un écart en soi, généralement un vestige,
et il doit être traité comme tel plutôt que servir de précédent.

### U4. Une intention métier, un fichier, un nom de verbe

Un fichier par usecase, nommé par le **verbe de l'intention** : `start-course`, `archive-organization`,
`reward-user`. Pas par la ressource, pas par la couche.

Le nom est celui du langage ubiquitaire du contexte. Deux contextes peuvent avoir un usecase du même
nom désignant deux choses différentes — c'est attendu, mais ça se paie à la lecture d'un import : il
faut savoir de quel contexte on parle.

### U5. Aucune notion de transport

Pas de `request`, pas de `h`, pas de code HTTP, pas de sérialisation, pas d'en-tête. Un usecase ne
sait pas comment il est appelé.

Le test : *ce usecase fonctionnerait-il tel quel appelé depuis un script ou un job ?* Si non, une
préoccupation de transport a fui.

### U6. Renvoie des objets du domaine

Un usecase renvoie des objets du domaine local, des read-models du contexte, ou des scalaires. Jamais
un objet façonné pour une réponse HTTP, jamais le DTO d'un autre contexte.

Le second cas est le plus discret : il vient presque toujours d'une violation en amont, dans un
repository qui n'a pas traduit — voir `fiche-repository.md`, I1.

### U7. Le périmètre transactionnel est explicite

Un usecase qui écrit à plusieurs endroits dit ce qui doit être atomique.

Quand la transaction est fournie par un contexte ambiant, elle n'apparaît pas dans la signature du
usecase : la lecture seule ne suffit donc pas à savoir s'il s'exécute dans une transaction. C'est un
coût assumé de la convention, et la contrepartie est qu'il faut **documenter le périmètre** quand il
n'est pas évident.

Voir A7 de `fiche-racine-agregat.md` : si une opération doit modifier deux agrégats de façon atomique,
c'est souvent que la frontière est mal placée.

### U8. Enregistré dans l'index des usecases

Tout fichier de `domain/usecases/` figure dans l'objet des usecases de l'index du contexte.

**Ce qui casse.** Rien à l'exécution — un usecase peut être importé directement. Mais l'index cesse
d'être la liste exhaustive de ce que le contexte sait faire, donc toute lecture d'ensemble devient
fausse, pour un humain comme pour un agent.

### U9. Aucun accès direct au domaine d'un autre contexte

Un usecase n'importe ni le domaine, ni l'infrastructure, ni les usecases d'un autre contexte. Il passe
par l'**API interne** de ce contexte, injectée comme les autres dépendances.

C'est la décision de l'ADR 55. Elle a un coût, que l'ADR liste explicitement — complexité
supplémentaire dans l'infrastructure, duplication possible des modèles — et qui a été accepté.

**Attention à un faux ami.** Une règle `dependency-cruiser` au grain du contexte laisse passer ces
imports quand le contexte cible est déclaré dans les dépendances autorisées. La vérification utile est
au grain de la **couche** : une dépendance vers un autre contexte doit cibler `application/api/`.

---

## 4bis. Un fichier de `domain/services/` est-il un usecase ?

Oui, dès qu'il fait des I/O. Et le test tient dans la signature :

> Un paramètre déstructuré dont le nom correspond à `/(Repository|Api|Storage)$/`.

Dans ce cas, **tous les invariants de la présente fiche s'appliquent**, sans exception : c'est un
sous-usecase partagé, quel que soit son dossier. Le partage entre plusieurs usecases est une raison
légitime de le factoriser, mais ce n'est pas ce qui en ferait un service de domaine.

Si le fichier ne reçoit aucune I/O et se contente de calculer une règle sur des objets déjà fournis,
c'est un vrai service de domaine : voir **`fiche-service-domaine.md`**, qui porte ses invariants
propres et les trois positions possibles sur le sort du dossier.

---

## 5. Exceptions légitimes

| Cas | Statut |
| --- | --- |
| Un usecase réduit à un seul appel de repository | **autorisé**, décidé en ADR 20 |
| Un `if` sur l'absence d'un résultat de chargement | **autorisé**, c'est de l'orchestration |
| Un usecase qui ne renvoie rien | **autorisé** — une intention peut n'avoir que des effets |
| Le fichier de câblage `usecases/index.js` importe l'infrastructure | **toléré** comme vestige, **pas** un précédent à invoquer |
| Un usecase reçoit un journal (`logger`) en dépendance injectée | **autorisé** — injecté, pas importé. À distinguer d'un modèle qui importe l'infrastructure |
| Un usecase enveloppe son corps dans un `try/catch` qui journalise | **à instruire** — commode, mais avale les erreurs de programmation et les rend invisibles |
| Un « service » sans I/O, en unitaire pur | **autorisé**, c'est le vrai service de domaine |
| Un « service » avec repositories | **pas une exception** — c'est un usecase, à traiter comme tel |

---

## 6. Vérification déterministe

*Section à instruire : les taux de faux positifs sont estimés.*

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| U3, U9 | règles `dependency-cruiser` de chemin | configuration seule | aucun |
| U5 | règle ESLint : identifiant `request`, `h`, ou import du framework HTTP dans `domain/` | ~20 lignes | aucun attendu |
| U8 | script `tests/tooling/` : complétude de l'index | ~30 lignes | aucun |
| U4 | script : un fichier de `usecases/` porte un nom en kebab-case commençant par un verbe | ~20 lignes | **à mesurer** — la liste des verbes est ouverte |
| 4bis | règle : un fichier de `domain/services/` ne reçoit pas de paramètre en `*Repository` | ~20 lignes | aucun, mais **sortira sur l'existant** |
| U1, U6, U7 | revue | — | — |

### U3 et U9 — deux règles de chemin

```js
{
  name: 'usecase-must-not-import-infrastructure',
  severity: 'error',
  from: {
    path: 'src/.+/domain/usecases/',
    pathNot: 'src/.+/domain/usecases/index\\.js$',
  },
  to: { path: 'src/.+/infrastructure/' },
}
```

```js
{
  name: 'context-dependency-must-target-internal-api',
  severity: 'error',
  from: { path: 'src/.+/domain/' },
  to: { path: 'src/.+/(domain|infrastructure)/' },   // affiner : uniquement vers un AUTRE contexte
}
```

La seconde est la plus utile et la plus délicate à écrire : il faut exprimer « un autre contexte que
le sien », ce que `dependency-cruiser` fait par groupes capturés dans les chemins. **À vérifier par
contre-épreuve avant de committer** — introduire un import fautif, confirmer que la règle sort, le
retirer.

Piège habituel : `src/.+/` et non `src/[^/]+/`, sinon les contextes à sous-contextes ne sont jamais
atteints et la règle ne se déclenche pas, sans le signaler.

### 4bis — la règle qui force la décision

Un fichier de `domain/services/` qui reçoit un paramètre dont le nom finit par `Repository` fait des
I/O, donc n'est pas un service de domaine.

Elle est triviale à écrire et sortira sur l'existant. **C'est son intérêt** : elle transforme une
ambiguïté de vocabulaire en décision datée. À introduire en avertissement le temps de trancher entre
les trois positions du § 4bis.

### Ce qui n'est pas mécanisable

U1 est le plus important et le moins vérifiable : distinguer une condition d'orchestration d'une règle
métier demande de savoir ce qui est métier. Aucun proxy fiable identifié.

Un indicateur imparfait, à ne pas transformer en règle : la **complexité cyclomatique** d'un usecase.
Un usecase très ramifié porte souvent des règles. C'est un signal pour la revue, pas un verdict.

### Codemods

Rentables sur U8 (inscription dans l'index) et U4 (renommage plus imports). Non rentables sur U1,
qui est un déplacement de logique vers le bon objet — de la conception.

---

## 7. En TypeScript

Le usecase est un **bon candidat tardif** : il dépend de tout le reste, donc il se type bien une fois
que les modèles et les ports le sont.

```ts
type StartCourseInput = { userId: number; code: string };
type StartCourseDeps = { courseRepository: CourseRepository; userRepository: UserRepository };

export async function startCourse(input: StartCourseInput, deps: StartCourseDeps): Promise<void> { … }
```

La forme ci-dessus sépare entrées et dépendances, ce qui n'est pas la convention actuelle. Avec la
convention actuelle — un seul objet — le typage reste possible et correct, mais la signature ne
distingue toujours pas les deux. Voir `fiche-repository.md` § 7 pour la discussion.

**Le blocage habituel :** `declare module '*.js'` donne `any` à tout import d'un `.js`. Un usecase en
`.ts` qui reçoit des repositories typés depuis des `.js` ne vérifie rien. Ordre imposé : modèles,
puis ports, puis usecases.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Usecase | **intégration uniquement** — base réelle, fixtures | l'orchestration de bout en bout et le résultat |
| Vrai service de domaine (sans I/O) | **unitaire pur** | la règle qu'il porte |
| Sous-usecase partagé (avec repositories) | **intégration**, comme un usecase | — |

Le choix de tester les usecases en intégration seulement est une convention d'équipe : elle évite des
tests unitaires qui ne feraient que vérifier l'ordre des appels à des doublures, ce qui reproduit
l'implémentation au lieu de la contraindre.

Corollaire de diagnostic : **si un usecase demande beaucoup de fixtures pour un cas simple, c'est
souvent que son agrégat est trop gros** — voir A6 de `fiche-racine-agregat.md`.

---

## 9. Checklist de revue

```
[ ] U1  Aucun calcul métier ; les if portent sur l'existence, pas sur des propriétés métier
[ ] U9  Aucun accès au domaine ni à l'infrastructure d'un autre contexte — API interne seulement
[ ] U3  Aucun import d'infrastructure
[ ] U2  Toutes les dépendances arrivent en paramètres
[ ] U6  Renvoie des objets du domaine local, jamais un DTO étranger ni un objet de réponse
[ ] U5  Aucune notion de transport : ni request, ni code HTTP, ni sérialisation
[ ] U7  Le périmètre atomique est explicite quand plusieurs écritures ont lieu
[ ] U4  Un fichier, un nom de verbe en kebab-case, langage ubiquitaire du contexte
[ ] U8  Enregistré dans l'index des usecases
[ ] Tests en intégration ; un service sans I/O est testé en unitaire pur
[ ] Si le fichier est dans services/ et reçoit un repository, c'est un usecase — § 4bis
```

---

## 10. Sources

Bibliographie dans `references-ddd.md`.

| Invariant | Source |
| --- | --- |
| **Le usecase comme couche** | Martin, *Clean Architecture*, ch. « Business Rules » — distinction *Entities* / *Use Cases*. Billet « The Clean Architecture », gratuit |
| **U1** aucune règle métier | Martin, même ch. — les règles d'entreprise sont dans les entités, les règles applicatives dans les usecases. Fowler, « AnemicDomainModel » pour le symptôme inverse |
| **U2** dépendances injectées | Martin, ch. « The Dependency Inversion Principle ». Pix : **ADR 46**, avec son motif ESM |
| **U3** aucun import d'infrastructure | Martin, « The Clean Architecture » — la règle de dépendance |
| **U4** une intention, un fichier | Pix : **ADR 20** pour le caractère obligatoire ; **ADR 51** pour l'arborescence. Le nommage par verbe n'a **aucune source** |
| **U5 / U6** aucune notion de transport | Martin, ch. « Presenters and Humble Objects » |
| **U7** périmètre transactionnel | Pix : **ADR 9 et 25**. Vernon, « Effective Aggregate Design », règle 4, pour la cohérence différée |
| **U8** enregistré dans l'index | **aucune source** — outillage Pix |
| **U9** API interne obligatoire | Pix : **ADR 55**, qui décide les APIs internes synchrones et énumère les coûts acceptés |
| **Le service de domaine** (§ 4bis) | Evans, *DDD*, ch. « A Model Expressed in Software » — le Service y est défini sans état et sans I/O |

**Deux invariants sur neuf n'ont aucune source** (U8, et le nommage par verbe de U4). C'est la fiche
la mieux adossée aux **ADR Pix** du corpus : quatre invariants y renvoient directement, ce qui les
rend contestables sur pièces plutôt que sur autorité.
