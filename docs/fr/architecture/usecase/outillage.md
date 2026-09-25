# Usecase — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Aucun plugin ESLint maison n'existe : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle. Les taux de faux positifs annoncés sont estimés, pas mesurés.

## Vérifications

Toute hypothèse sur le comportement d'un outil se vérifie par contre-épreuve : introduire la
violation, confirmer que l'outil la signale, puis retirer la violation.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **U3** aucun import d'infrastructure | règle `dependency-cruiser` de chemin, avec exemption du câblage | configuration seule | aucun |
| **X6** API interne injectée dans le usecase, signal | règle ESLint : paramètre en `/Api$/` dans un fichier de `domain/usecases/`, câblage exclu | ~20 lignes | aucun attendu : le suffixe `Api` est la convention des APIs internes |
| **U9** API interne obligatoire | règle `dependency-cruiser` au grain de la couche | configuration seule | aucun, si « un autre contexte » est bien exprimé |
| **U5** aucune notion de transport | règle ESLint : identifiant `request` ou `h`, ou import du framework HTTP | ~20 lignes | aucun attendu |
| **U8** enregistré dans l'index | script `tests/tooling/` | ~30 lignes | aucun |
| Le discriminant usecase / Domain Service | règle ESLint : un fichier de `domain/services/` reçoit un paramètre en `/(Repository\|Api\|Storage)$/` | ~20 lignes | aucun, mais **se déclenchera sur l'existant** |
| **U4** nom de verbe | script : nom en kebab-case commençant par un verbe | ~20 lignes | **à mesurer** : la liste des verbes est ouverte |
| **U1**, **U2**, **U6**, **U7** | revue | — | — |

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

L'exemption du `pathNot` rend la règle activable malgré `X3` de [`ecarts.md`](ecarts.md). Elle est
plus large que nécessaire sur un point : le fichier exempté peut alors importer l'infrastructure d'un
**autre** contexte, ce qui reste une violation.

```js
{
  name: 'context-dependency-must-target-internal-api',
  severity: 'error',
  from: { path: 'src/.+/domain/' },
  to: { path: 'src/.+/(domain|infrastructure)/' },   // à affiner : uniquement vers un AUTRE contexte
}
```

La seconde règle est la plus utile et la plus délicate à écrire. Elle doit exprimer « un autre
contexte que le sien », ce que `dependency-cruiser` fait par groupes capturés dans les chemins. **Elle
se vérifie par contre-épreuve avant tout commit.**

**Faux ami.** Une règle `dependency-cruiser` au grain du contexte laisse passer ces imports quand le
contexte cible est déclaré dans les dépendances autorisées. La vérification utile est au grain de la
**couche** : une dépendance vers un autre contexte doit cibler `application/api/`.

`severity: 'error'` est obligatoire dans les deux cas : la valeur par défaut est `warn`, et seul
`error` fait échouer la commande. Le chemin s'écrit `src/.+/` et non `src/[^/]+/`. Sinon, les
contextes à sous-contextes ne sont pas atteints, et la règle ne se déclenche jamais, sans le signaler.

La règle jumelle, qui exempte le fichier de câblage pour tout le domaine, est écrite dans
[`../repository/outillage.md`](../repository/outillage.md#i11-et-i5--règles-de-chemin).

### U5 — règle ESLint

La règle de U5 ne couvre ni les codes HTTP, ni la sérialisation, ni les en-têtes. Ces cas restent en
revue, d'où le statut `[partiel]` de la ligne U5 dans la checklist.

### Le discriminant — la règle qui force la décision

Un fichier de `domain/services/` qui reçoit un paramètre dont le nom finit par `Repository`, `Api` ou
`Storage` fait des I/O. Ce n'est donc pas un Domain Service. C'est la règle de signature de `D1`, dans
[`../service-domaine/README.md`](../service-domaine/README.md).

La règle est triviale à écrire. Elle se déclenchera sur l'existant, et c'est voulu : elle produit la
liste des fichiers de `services/` à classer. Elle reste en avertissement jusqu'à la fin de ce
classement, préalable à la correction de `X1` de
[`../service-domaine/ecarts.md`](../service-domaine/ecarts.md).

Le même parcours d'AST sert l'étape 1 de I1 dans
[`../repository/outillage.md`](../repository/outillage.md#i1--deux-étapes), qui repère déjà les
paramètres en `/Api$/`.

### Ce qui n'est pas mécanisable

U1 est, avec U9, l'invariant le plus rentable, et c'est le moins vérifiable. Distinguer une condition
d'orchestration d'une règle métier demande de savoir ce qui est métier. Aucun indicateur fiable n'est
identifié.

La **complexité cyclomatique** d'un usecase est un indicateur imparfait : un usecase très ramifié
porte souvent des règles. C'est un signal pour la revue, pas un verdict. Cet indicateur n'est pas
transformé en règle : en faire un seuil bloquant produirait des contournements plutôt que des
corrections.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **U3** : configuration `dependency-cruiser`, avec l'exemption du câblage et contre-épreuve.
2. **U5** : première règle ESLint sur mesure.
3. **U8** : script de complétude de l'index.
4. **Le discriminant** : en avertissement, pour produire la liste des fichiers de `services/` à
   classer.
5. **U9** : une fois « un autre contexte que le sien » exprimé.
6. **U4** : après mesure des faux positifs sur la liste des verbes.

### Corriger les violations

Critère de la table : un codemod peut appliquer une décision. Il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **U8** index | oui, complet | Insère l'import et la clé dans l'index. Purement syntaxique |
| **U4** nommage | oui, complet | Renomme le fichier et réécrit ses imports |
| Le discriminant | oui, une fois le classement fait | Déplace un fichier de `services/` vers `usecases/` et réécrit ses imports. Signale un câblage dédié |
| **X2** objet de réponse | partiel | Retire l'enveloppe quand il y en a une. Ne décide pas si la bonne réponse est un read-model |
| **X1** règle dans le usecase | non | Déplacer une règle vers le bon objet est de la conception |

---

## Vérifier par le typage

Un usecase se type **une fois que ses dépendances le sont**. Il est en bout de chaîne : il consomme
des ports et des modèles. Son typage ne vérifie donc rien tant que ceux-ci sont en JavaScript.
L'ordre de migration et les contraintes de syntaxe imposées par la configuration sont dans
`../migration-typescript.md`.

```ts
type GetVerifiedCodeInput = { code: string };
type GetVerifiedCodeDeps = {
  campaignRepository: CampaignRepository;
  combinedCourseRepository: CombinedCourseRepository;
};

export const getVerifiedCode = async (
  input: GetVerifiedCodeInput,
  deps: GetVerifiedCodeDeps,
): Promise<VerifiedCode> => { … };
```

**Code.** Forme hypothétique : aucun usecase n'est en TypeScript.

La forme ci-dessus sépare entrées et dépendances, ce que la convention de `X4` de
[`ecarts.md`](ecarts.md) ne fait pas. Avec un seul objet, le typage reste possible et correct :

```ts
export const getVerifiedCode = async (
  params: GetVerifiedCodeInput & GetVerifiedCodeDeps,
): Promise<VerifiedCode> => { … };
```

**Code.** Forme hypothétique.

La signature ne distingue toujours pas les deux : c'est `X4`, et le typage ne le résout pas. Ne pas
attacher la séparation à la migration : voir
[`explication.md`](explication.md#entrées-et-dépendances-et-le-typage).

Les ports déclarés rendent vérifiable ce que le usecase appelle sur ses dépendances. Leur forme et la
façon de s'y conformer sont dans
[`../repository/outillage.md`](../repository/outillage.md#vérifier-par-le-typage).
