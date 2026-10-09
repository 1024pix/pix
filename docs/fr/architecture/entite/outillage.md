# Entity — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Aucun plugin ESLint maison n'existe : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle. knip est déjà branché dans `npm run lint`.

## Vérifications

Les taux de faux positifs annoncés sont estimés, pas mesurés. Toute hypothèse sur le comportement
d'un outil se vérifie par contre-épreuve :

- introduire la violation ;
- confirmer que l'outil la signale ;
- retirer la violation.

**Une limite pour toute cette section.** Les règles portent sur `domain/models/`, qui contient aussi
les Value Objects et peut-être des Aggregate Roots. Elles se déclencheront donc sur des fichiers qui
ne sont pas des Entities. Cette limite vient de
[`X4` de `ecarts.md`](ecarts.md#x4-larborescence-ne-distingue-pas-entity-et-value-object), et elle
réduit la précision de toutes les règles de cette section.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **E4** aucune I/O | règle `dependency-cruiser` de chemin, pour les imports seulement. L'horloge, l'aléatoire et la configuration restent en revue | configuration seule | aucun |
| **E6** aucun mutateur nu | règle ESLint : `set` public dans `domain/models/` | ~20 lignes | aucun attendu |
| **E8** nommage et emplacement | script `tests/tooling/` | ~20 lignes | aucun |
| **E3** invariants tenus | règle ESLint : constructeur en `= {}` sans appel de validation | ~40 lignes | **élevés sur l'existant** : voir [`X1` de `ecarts.md`](ecarts.md#x1-le-constructeur-en-sac-de-propriétés) |
| **X3** validation après affectation | sans objet : c'est la forme prescrite. Voir [`X3` de `ecarts.md`](ecarts.md#x3-la-validation-a-lieu-après-laffectation) | — | — |
| **E1** identité explicite | règle ESLint : une classe de `domain/models/` expose un accesseur `id` | ~15 lignes | **non mesurés** : un Value Object porteur d'identifiant la déclenche |
| **E5** pas de méthode de persistance | revue. knip, déjà branché, ne signale que les exports sans consommateur | — | — |
| **E2** l'égalité se fonde sur l'identité | revue | — | — |
| **E7** les autres Aggregates sont référencés par identité | revue | — | — |

### E4 — une règle de chemin

```js
{
  name: 'domain-model-must-not-import-infrastructure',
  severity: 'error',
  from: { path: 'src/.+/domain/models/' },
  to: { path: 'src/.+/infrastructure/' },
}
```

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Le chemin s'écrit `src/.+/`, pas `src/[^/]+/`. Avec la seconde forme, les contextes à
sous-contextes ne sont pas atteints : la règle ne s'y déclenche jamais, sans aucun message.

Cette règle est partagée avec `V4` de `../objet-valeur/README.md`, que `../specification/README.md`
reprend pour ses critères : une seule configuration couvre les trois.

### E6 — mutateur nu

Décidable localement, deux motifs :

- une déclaration `set nom(valeur)` dans un fichier de `domain/models/` ;
- un champ de classe public affecté hors du constructeur.

Le second est plus utile et plus délicat : il demande de distinguer l'affectation dans le
constructeur de celle dans une méthode. Le cas net, le `set` explicite, précède donc le second motif.

### E3 — la règle la plus utile et la plus bruyante

Le motif : un constructeur dont le paramètre est déstructuré avec `= {}`, et dont le corps ne comporte
**aucun appel de validation**, sous aucune forme. Ni garde écrite à la main, ni appel à l'utilitaire
de validation par schéma.

Ce motif désigne exactement la forme dominante de violation. La règle se déclenchera donc sur
beaucoup d'Entities existantes. L'introduire en avertissement, après une décision sur l'ampleur du
rattrapage : voir la correction de
[`X1` de `ecarts.md`](ecarts.md#x1-le-constructeur-en-sac-de-propriétés).

Ce que la règle ne doit pas signaler : une validation placée après les affectations. C'est la forme
prescrite par la documentation d'architecture, voir
[`X3` de `ecarts.md`](ecarts.md#x3-la-validation-a-lieu-après-laffectation). Une règle qui
l'attraperait se déclencherait sur la quasi-totalité des modèles.

Ce que la règle ne voit pas : une validation partielle, qui existe pour un champ et manque pour les
autres. La règle cherche l'absence de tout appel de validation, donc ce cas reste en revue.

### E1 — accesseur d'identité

Une règle ESLint porte sur les classes de `domain/models/` qui exposent un accesseur `id`. Un Value
Object porteur d'identifiant la déclenche, et ce bruit n'est pas mesuré. Mesurer les faux positifs
sur les Value Objects porteurs d'identifiant avant de l'activer. Le traitement du cas non persisté
reste en revue.

### E8 — script de nommage

Un script de `tests/tooling/` vérifie le nommage et l'emplacement : un fichier par Entity, en
PascalCase, dans `domain/models/`.

### E5 — knip ne suffit pas

knip signale les exports que rien n'importe. Une méthode dont le seul consommateur est le repository
est consommée, donc knip ne la signale pas. Il ne sait pas non plus compter les consommateurs d'un
export : un export à consommateur unique passe sans signalement. E5 reste donc en revue.

knip aide seulement après la correction : une fois la traduction déplacée dans le repository, un
export resté sans consommateur apparaît dans sa sortie. Il ne décide pas non plus de l'exception du
format publié.

### Ce qui n'est pas mécanisable

E2 et E7 demandent de savoir ce qui appartient au même Aggregate. E5 demande de savoir ce qui est un
format publié. Ces deux informations ne se lisent pas dans un fichier isolé, et elles ne sont écrites
nulle part. C'est le même manque que celui relevé dans `../racine-agregat/outillage.md`.

### Tests attendus — existence du fichier

L'existence du fichier de test se vérifie par comparaison des noms de base, comme pour les
repositories : voir `../repository/outillage.md`, section « Tests attendus — par le même script ».

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **E4** : configuration `dependency-cruiser`, avec contre-épreuve
2. **E6** : première règle ESLint sur mesure, ce qui suppose de créer l'infrastructure
3. **E8** : script de nommage
4. **E3** : en avertissement, pour produire la liste du rattrapage
5. **E1** : après mesure des faux positifs sur les Value Objects porteurs d'identifiant

### Corriger les violations

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart ou invariant | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **E8** nommage | oui, complet | Renommer le fichier et réécrire ses imports |
| **E6** champs publics | partiel | Privatiser un champ et ajouter son accesseur, oui. Si le champ est **écrit** depuis l'extérieur, signaler et s'arrêter : ajouter un mutateur violerait E6 |
| **X1** sac de propriétés | préparation seule | Repérer les constructeurs fautifs, oui. Décider quels champs sont requis, non |
| `X1` de `../usecase/ecarts.md`, règles dans les usecases | non | Décider ce qui appartient à l'Entity et ce qui est de l'orchestration est de la conception |

---

## Vérifier par le typage

Forme cible. Elle ne s'applique qu'après la migration des modèles en `.ts` : les contraintes de
syntaxe imposées par la configuration sont dans `../migration-typescript.md`.

Une Entity se déclare en **classe** : voir [`explication.md`](explication.md#pourquoi-une-classe).

```ts
export class Organization {
  readonly id: number;
  #archivedAt: Date | null;

  constructor(params: { id: number; archivedAt?: Date | null }) { /* validation */ }

  get isArchived(): boolean { return this.#archivedAt !== null; }
  // pas de mutateur ici : le code actuel n'a aucune méthode d'archivage sur cette Entity,
  // `archivedAt` y est aujourd'hui affecté par construction
}
```

**Code.** Extrait hypothétique : aucune Entity n'est encore en TypeScript.

Deux bénéfices, qui portent sur les invariants les plus souvent en défaut.

**E3 devient partiellement structurel.** Des champs non optionnels dans le type du constructeur
suppriment le sac de propriétés permissif : l'appelant ne peut plus omettre ce qui est requis. La
validation de valeur reste nécessaire, la validation de présence devient gratuite.

**E7 devient lisible.** `organizationId: number` plutôt qu'`organization: Organization` est une
différence visible dans la signature, donc revue à la lecture.

`readonly` est effacé à la compilation : il empêche l'écriture au typage, pas à l'exécution. E6
repose sur les champs privés, pas sur `readonly`.
