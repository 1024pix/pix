# Repository — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. La configuration `dependency-cruiser` de `api/` contient
trois règles, sur les tests et les migrations, plus les règles générées depuis les déclarations de
dépendances de chaque contexte. Aucun plugin ESLint maison n'existe : toute règle sur mesure suppose
d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la règle.

## Vérifications

Outils disponibles : configuration `dependency-cruiser`, avec des règles générées depuis les
déclarations de dépendances de chaque contexte ; configuration ESLint ; knip, déjà branché dans
`npm run lint` ; scripts dans `tests/tooling/` ; ls-lint ; et le typage après migration.

Précision sur les coûts :

- Les lignes dont le moyen est le typage ne vérifient rien avant que la chaîne de types soit migrée.
  Voir `../migration-typescript.md`.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **I12** connexion par `DomainTransaction` | règle `dependency-cruiser` de chemin : un fichier de `infrastructure/repositories/` n'importe pas `db/knex-database-connection.js` | configuration seule | aucun : la connexion du datamart est un autre fichier, `datamart/knex-database-connection.js`, que la règle ne vise pas |
| **I11** n'importe pas un autre repository | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **I5** dépendances injectées | règle `dependency-cruiser` de chemin | configuration seule | aucun |
| **I4** erreurs du domaine — partiel | `no-restricted-syntax` ESLint | configuration seule | aucun |
| **I3** `get*` lève, `find*` renvoie `null` | règle ESLint sur mesure | ~50 lignes | faibles, si les préfixes sont listés |
| **I10** aucune fonction de lecture qui écrit — signal | règle ESLint sur mesure | ~30 lignes | aucun au sens strict : un `getOrCreate*` qui écrit est signalé à dessein, et la revue juge |
| **I6** enregistré dans l'index, **+ I9** nommage | script `tests/tooling/` | ~40 lignes | aucun |
| **Tests** un fichier de test existe | même script | ~15 lignes de plus | aucun |
| **Tests** test au bon endroit, unitaire ou intégration | même script + le parcours d'AST de I1 | ~25 lignes de plus | faibles |
| **I1** passe-plat direct — étape 1 | règle ESLint sur mesure | ~50 lignes | aucun |
| **I1** passe-plat via variable — étape 2 | même règle, élargie | ~30 lignes de plus | faibles |
| **I1** complet, **I2** en entrée | typage | migration TypeScript | — |
| **I10** aucune règle métier — complet | aucun moyen identifié | — | — |

### I12 — règle de chemin

```js
{
  name: 'repository-must-not-import-knex',
  severity: 'error',
  from: { path: 'src/.+/infrastructure/repositories/' },
  to: { path: '^db/knex-database-connection\\.js$' },
}
```

La connexion du datamart vit dans un autre fichier, `datamart/knex-database-connection.js`. La règle
ne la vise pas, ce qui couvre l'exception du datamart sans liste d'exclusion. L'écriture qui doit
survivre à la transaction reçoit sa connexion en paramètre, donc n'importe rien : elle ne déclenche
pas la règle non plus. Le chemin exact de la cible se vérifie par contre-épreuve, comme pour les
règles suivantes.

### I11 et I5 — règles de chemin

```js
{
  name: 'repository-must-not-import-repository',
  severity: 'error',
  from: {
    path: 'src/.+/infrastructure/repositories/',
    pathNot: 'src/.+/infrastructure/repositories/index\\.js$',
  },
  to: { path: 'src/.+/infrastructure/repositories/' },
}
```

```js
{
  name: 'repository-must-not-import-internal-api',
  severity: 'error',
  from: {
    path: 'src/.+/infrastructure/repositories/',
    pathNot: 'src/.+/infrastructure/repositories/index\\.js$',
  },
  to: { path: 'src/.+/application/api/' },
}
```

Trois points d'implémentation.

`severity: 'error'` est obligatoire. La valeur par défaut est `warn`, et seul `error` fait échouer la
commande.

Le chemin s'écrit `src/.+/`, et non `src/[^/]+/`. Avec `src/[^/]+/`, un contexte à sous-contextes
n'est pas atteint, et la règle ne se déclenche jamais, sans erreur ni avertissement.

La règle se vérifie par contre-épreuve. Un import fautif introduit dans un sous-contexte doit la
déclencher. L'import est retiré ensuite.

Règle jumelle, pour interdire au domaine d'importer l'infrastructure. Elle sert `U3` de
`../fiche-usecase.md` et vit ici parce qu'elle partage les pièges des précédentes. Le fichier de
câblage en est exempté : il importe l'infrastructure par fonction, et il est toujours au même chemin.
Voir `X3` de `../fiche-usecase.md`.

```js
{
  name: 'domain-must-not-import-infrastructure',
  severity: 'error',
  from: {
    path: 'src/.+/domain/',
    pathNot: 'src/.+/domain/usecases/index\\.js$',
  },
  to: { path: 'src/.+/infrastructure/' },
}
```

L'exemption laisse le câblage faire son travail et garde la règle active sur tout le reste du domaine.
Elle est plus large que nécessaire sur un point : le fichier exempté peut alors importer
l'infrastructure d'un **autre** contexte, ce qui reste une violation. La détecter demande une seconde
règle, qui exprime « un autre contexte que le sien » par un groupe capturé. C'est dans cette seconde
règle que le piège `src/.+/` contre `src/[^/]+/` se pose réellement : elle doit traiter les contextes à
sous-contextes.

### I4 — sélecteur ESLint

Pour « jamais un `Error` nu » :

```js
{
  // src/** et non src/*/ : voir le piège des sous-contextes plus haut
  files: ['src/**/infrastructure/repositories/**/*.js'],
  rules: {
    'no-restricted-syntax': ['error', {
      selector: "ThrowStatement > NewExpression[callee.name='Error']",
      message: 'Un repository lève une erreur du domaine.',
    }],
  },
}
```

Pour « l'erreur vient d'un `domain/errors.js` », la règle croise la classe levée avec la source de son
import. C'est une règle sur mesure, dont l'analyse reste locale au fichier.

### I3 — règle ESLint

Syntaxique et locale. Pour chaque fonction exportée :

- nom en `/^get/` → exiger un `throw` sur le chemin « absent » ;
- nom en `/^find/` → interdire de lever une erreur d'absence.

Liste d'exclusion obligatoire : `getOrCreate*` commence par `get` et ne lève pas. Sans elle, la règle
produit un faux positif dès la première exécution.

### I10 signal — préfixe de lecture sur une fonction qui écrit

L'invariant complet n'est pas décidable. Le signal l'est, sans quitter la fonction :

> Une fonction exportée dont le nom commence par `get`, `find`, `is` ou `has`, et dont le corps
> contient un appel d'écriture sur la connexion.

Un nom qui annonce une lecture sur une fonction qui écrit est trompeur, indépendamment du contenu de
l'écriture. La règle ne prouve pas la violation de I10, elle désigne l'endroit où regarder.

`getOrCreate*` est inclus ici, alors qu'il est exclu de I3. Les deux règles regardent la même fonction
sans en tirer la même conclusion : I3 juge le comportement en cas d'absence, I10 juge la
correspondance entre le nom et le corps. Même parcours d'AST que I3.

### I6 et I9 — un script de complétude

Le script liste les fichiers de `src/<contexte>/infrastructure/repositories/**`, `index.js` exclu. Il
extrait les clés de l'objet des repositories dans l'index, puis compare les deux listes. Aucun faux
positif n'est possible. Le script peut vivre comme test plutôt que comme lint.

Le même script couvre I9 pour une dizaine de lignes de plus. Il connaît le contexte parcouru, donc il
peut appliquer la cohérence interne au contexte, là où ls-lint n'imposerait qu'une convention unique.

ls-lint ne convient pas pour I9 : ses règles d'extension ne descendent pas dans les sous-dossiers.
C'est vérifié par contre-épreuve : un mauvais nom à la racine de `api/` échoue, le même nom sous
`api/src/…/` passe. Étendre la portée à `src/**` est une décision à part.

### Tests attendus — par le même script

Le script parcourt déjà les fichiers de repository. Deux vérifications s'y greffent.

**Existence.** Chaque repository a un fichier de test. La correspondance se fait sur le **nom de
base**, après retrait du suffixe de test : un repository peut vivre dans un sous-dossier alors que son
test est à plat, et le suffixe de test n'est pas le même partout. Comparer les chemins produirait des
faux positifs là où comparer les noms de base n'en produit aucun.

La comparaison détecte deux cas, un dans chaque sens :

- un repository sans test ;
- un test dont aucun repository ne porte le nom. Ce cas détecte la faute de frappe dans un nom de
  fichier de test, qui sinon passe inaperçue puisque le test tourne quand même.

**Emplacement.** La source se lit dans les paramètres injectés, sans quitter le fichier :

| Signal dans le repository | Test attendu |
| --- | --- |
| un paramètre dont le nom correspond à `/Api$/` | unitaire, l'API mockée |
| un paramètre de connexion, ou un appel sur la connexion | intégration |
| les deux | les deux |
| aucun des deux | non classable : signalé, jamais deviné |

Le parcours d'AST est celui de I1 étape 1, qui repère déjà les paramètres en `/Api$/`. Coût marginal.

Cette vérification détecte un cas que la revue humaine laisse passer : un repository adossé à une API
et testé en intégration. Rien n'échoue, mais la suite monte une base de données pour rien à chaque
exécution.

**Trois limites.**

- Un fichier mixte attend les deux types. La règle exige donc *au moins* le type correspondant,
  jamais l'exclusivité.
- Une dépendance dont le nom ne finit pas par `Api`, comme un client ou un agent, n'est pas détectée.
  Le signal est suffisant, il n'est pas complet.
- Les exceptions légitimes restent : un repository dont les fonctions ne renvoient que des scalaires n'a
  rien à traduire, donc rien à tester en unitaire.

Ces limites classent l'emplacement en faux positifs faibles plutôt qu'inexistants.

Le suffixe `Api` sur un paramètre ne remet pas la source dans le nommage de la couche : il nomme la
dépendance pour ce qu'elle est, là où un nom de fichier annoncerait la source du repository lui-même.

### I1 — deux étapes

L'énoncé complet demande de suivre l'origine des valeurs, donc une analyse de flot. Deux sous-cas se
détectent sans quitter la fonction.

**Étape 1 — passe-plat direct.** Zéro faux positif.

> Un `return` (ou `return await`) dont l'expression est directement un appel de méthode sur un
> paramètre dont le nom correspond à `/Api$/`, ou sur une propriété en `/Api$/` d'un paramètre, comme
> `dependencies.userTeamsApi`.

Les cas acceptables, un effet de bord sans retour, ne comportent pas de `return`.

**Étape 2 — passe-plat via une variable locale.** Faux positifs faibles.

> Une variable affectée depuis un `await` sur un paramètre en `/Api$/`, puis renvoyée sans passer par
> un constructeur ni par une fonction locale. Le renvoi peut être direct, par indexation, ou via une
> expression conditionnelle.

```js
// l'étape 1 ne voit pas ceci
export async function findById({ userId, userApi }) {
  const users = await userApi.getActiveByUserIds({ userIds: [userId] });
  return users ? users[0] : null;
}
```

**Code.** [`user-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/infrastructure/repositories/user-repository.js#L1-L4).

Les faux positifs de l'étape 2 viennent des fonctions qui renvoient un scalaire extrait de la réponse,
autorisées par les exceptions légitimes.

Élargissement suivant, après l'étape 2 : `return <résultat d'await sur une requête>` sans passage par
un constructeur ou une fonction de mapping locale.

### I2 — pas de vérification propre

Vérifier les entrées demanderait de suivre les valeurs entre fichiers, hors de portée d'ESLint.
L'invariant tombe aussi si I1 est tenu : si aucun repository ne renvoie de DTO étranger, aucun DTO
étranger ne circule pour être passé en entrée. I2 se traite en corrigeant I1, puis par le typage.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **I12**, **I11** et **I5** — configuration `dependency-cruiser`, avec `severity: 'error'` et contre-épreuve
2. **I4 partiel** — sélecteur `no-restricted-syntax`
3. **I6 + I9 + existence des tests** — un seul script de complétude
4. **I3** — première règle ESLint sur mesure, ce qui suppose de créer l'infrastructure de plugin
5. **I10 signal** — même parcours d'AST que I3
6. **I1 étape 1** puis **étape 2**, après correction des violations relevées dans le rapport de
   divergence
7. **Emplacement des tests** — réutilise le parcours d'AST de I1 étape 1
8. **I1 complet / I2** — par le typage, dans l'ordre de `../migration-typescript.md`

Toute hypothèse sur le comportement d'un outil se vérifie par contre-épreuve avant d'être écrite :
introduire la violation, confirmer que l'outil la signale, retirer la violation.

### Corriger les violations

`api/codemods/` existe comme convention. Aucun outil de codemod n'est déclaré dans les dépendances.
En revanche, le paquet `typescript` est présent en dépendance de développement, pour `lint:types`.
Son API de compilation suffit à lire un AST et à réécrire des fichiers.

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **I6** enregistré dans l'index | oui, complet | Insérer l'import et la clé dans l'index. Purement syntaxique |
| **I9** nommage cohérent | oui, complet | Renommer le fichier et réécrire tous les imports. La partie risquée est la mise à jour des appelants |
| **I5** dépendances injectées | oui, complet | Transformer un import direct en paramètre injecté et l'ajouter à l'index |
| **I12** connexion par `DomainTransaction` | oui, à relire | Remplacer l'import de `knex` par `DomainTransaction.getConnection()`. Une écriture faite hors transaction à dessein doit être repérée avant : elle relève d'une exception légitime |
| **I11** n'importe pas un autre repository | partiel | Déplacer la composition vers le usecase appelant demande de savoir lequel, et de décider de l'ordre des appels |
| **I3** `get*` lève, `find*` renvoie `null` | partiel | Renommer et propager aux appelants, oui. Décider de quel côté corriger, non : faire lever un `find*` change le comportement de chaque site d'appel |
| **I4** erreurs du domaine | préparation seule | Repérer les `throw new Error(...)`, oui. Choisir l'erreur de domaine, non : ce choix détermine le code HTTP et le code d'erreur |
| **I1** en sortie, **I2** en entrée | préparation seule | Générer un squelette de type local à partir des champs lus chez les appelants. Le mapping est de la conception |
| **I10** règle métier | non | Déplacer du code entre couches demande de décider où il va |

À ne pas faire : un codemod qui « corrige » I1 en enveloppant le DTO étranger dans une classe locale
aux mêmes champs. Le lint passe au vert et la dette devient invisible. Sur I1, un codemod produit un
`TODO` et un squelette à remplir, jamais un mapping identité.

#### Fixer ESLint ou script

Un fixer ESLint ne peut modifier que le fichier où la règle se déclenche. C'est ce qui décide de la
forme.

| Nature de la correction | Forme | Pourquoi |
| --- | --- | --- |
| Renommer un fichier et réécrire ses importateurs (I9) | script | multi-fichiers par nature, hors de portée d'un fixer |
| Compléter l'index (I6) | script, ou test qui échoue en indiquant la ligne à ajouter | la détection lit le dossier, la correction porte sur un autre fichier |
| Remplacements locaux à un fichier | fixer ESLint | corrigé par `eslint --fix`, donc de façon permanente : les nouvelles violations sont réparées à la sauvegarde |

Peu d'invariants relèvent de la troisième ligne. I3 et I4 demandent une décision, I1 ne doit pas avoir
de fixer. Le travail mécanisable est donc dans des scripts.

#### Facilités en place

`lint:format` vérifie seulement ; c'est `lint:format:fix` qui reformate. Un codemod n'a pas à
préserver l'indentation, à condition de lancer la variante `:fix` après. Point non vérifié : la
configuration ESLint, qui hérite de `@1024pix/eslint-plugin`, porte-t-elle une règle de tri
d'imports ? Sinon, l'ordre des imports est rétabli par le formateur, ou pas du tout.

La règle de lint est l'oracle du codemod. Écrite d'abord, elle donne la liste exhaustive des sites et
le critère de succès : `npm run lint` doit passer au vert après passage du codemod.

---

## Vérifier par le typage

Forme cible, qui corrige `X1` de [`ecarts.md`](ecarts.md). Elle ne s'applique qu'après la migration
des modèles en `.ts` : voir `../migration-typescript.md`.

Le contrat d'un repository se déclare dans un port. Sans port déclaré, le contrat est le nom du paramètre
déstructuré dans le usecase, et l'invariant « implémente un port du domaine » n'a aucun support dans
le code.

```ts
// domain/ports/combined-course-repository.ts
import type { CombinedCourse } from '../models/combined-courses/entities/CombinedCourse.ts';

export type CombinedCourseRepository = {
  getById(params: { id: number }): Promise<CombinedCourse>;
  getByCode(params: { code: string }): Promise<CombinedCourse>;
  save(params: { combinedCourse: CombinedCourse }): Promise<number>;
};
```

Le type dit ce que le nom promettait sans pouvoir le garantir : `getById` rend un `CombinedCourse`,
pas `CombinedCourse | null`. **I3 devient une conséquence du typage** pour les `get…`.

### Forme de conformité

L'implémentation se déclare fonction par fonction. Le message d'erreur désigne la fonction fautive.

```ts
import type { CombinedCourseRepository } from '../../domain/ports/combined-course-repository.ts';

export const getById: CombinedCourseRepository['getById'] = async ({ id }) => { … };
```

Un repository est un module de fonctions, conformément à la forme d'injection décidée par ADR 46.
L'annotation par fonction donne au site de définition la même garantie qu'un `implements`.

À ne pas utiliser : une assertion `satisfies` sur le module entier. Elle ne s'efface pas au type
stripping (voir `../migration-typescript.md`), et elle impose un auto-import du module dans lui-même.

### Complétude

L'annotation par fonction ne garantit pas qu'aucune fonction du port ne manque. Deux voies : un test
de conformité, où un import de valeur et une assertion `satisfies` sont sans coût ; ou laisser l'index
du contexte échouer, s'il déclare le repository contre son type de port. La seconde place la
vérification là où le câblage a lieu.
