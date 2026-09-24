# Read-model — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Il n'existe aucun plugin ESLint maison : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle.

Les taux de faux positifs annoncés sont estimés. Toute hypothèse sur le comportement d'un outil se
vérifie par contre-épreuve :

- introduire la violation ;
- confirmer que l'outil la signale ;
- retirer la violation.

## Vérifications

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **RM3** n'entre pas dans une règle | règle `dependency-cruiser` de chemin | configuration seule | **après X1** : avant le classement, la règle se déclenche aussi sur les Value Objects mal rangés |
| **RM4** emplacement | script `tests/tooling/` : aucun homonyme d'un read-model hors de `read-models/` | ~20 lignes | faibles |
| **Tests** un fichier de test existe | même script | ~15 lignes de plus | aucun |
| **RM2** aucune validation — signal | règle ESLint : un `throw` dans un fichier de `read-models/` | ~15 lignes | faibles |
| **RM1** aucune règle métier | aucun moyen : distinguer une dérivation de présentation d'une règle métier n'est pas décidable | — | — |
| **V1**, **V2**, **V4**, **V6**, **V7** communs | voir `../objet-valeur/outillage.md` | — | — |

### RM3 — une règle de chemin

La règle s'écrit telle quelle : les deux dossiers sont déjà frères.

```js
{
  name: 'domain-rule-must-not-import-read-model',
  severity: 'error',
  from: { path: 'src/.+/domain/(models|services)/' },
  to: { path: 'src/.+/domain/read-models/' },
}
```

Elle attrape des cas réels, mais pas ceux que son nom annonce. Ce sont surtout des **modèles du domaine
qui fabriquent des read-models**, pas des règles qui en lisent un. Le sens de la flèche est inversé,
mais le couplage est le même : un modèle du domaine connaît la forme d'une sortie.

Deux pièges :

- Seul `error` fait échouer la commande, et la valeur par défaut est `warn`. `error` est la valeur
  cible. Tant que `X1` de [`ecarts.md`](ecarts.md) n'est pas corrigé, la règle reste en `warn`.
- Le chemin s'écrit `src/.+/`, pas `src/[^/]+/`. Avec la seconde forme, la règle n'atteint pas les
  contextes à sous-contextes. Elle ne s'y déclenche jamais, sans aucun message.

Ce qui empêche de la rendre bloquante n'est pas le nommage, mais le classement. Un Value Object rangé
dans `read-models/` déclenche la règle alors qu'il est légitime. En `warn`, la règle produit la liste
des fichiers à classer. Elle passe en `error` après X1.

### RM2 signal — un `throw` dans un read-model

Syntaxique et local au fichier. Un read-model ne valide pas, donc il ne lève pas d'erreur de
validation. Même pour une source externe, la validation revient au repository (`I1` de
[`../repository/README.md`](../repository/README.md#i1-ne-jamais-renvoyer-une-structure-de-persistance)),
pas au read-model.

La règle ne prouve pas la violation : elle désigne où regarder.

### RM4 et l'existence des tests — un script

Le script parcourt les fichiers de `read-models/`. Deux vérifications :

- **RM4** : aucun fichier hors de `read-models/` ne porte le nom d'un read-model. Le script ne
  repère donc que les homonymes. Un read-model rangé ailleurs sous un nom unique, comme l'exemple
  fautif de RM4, lui échappe : ce cas reste à la revue. Faux positifs faibles : une homonymie avec une
  Entity est possible.
- **Tests** : chaque fichier a un fichier de test. La correspondance se fait sur le **nom de base**,
  après retrait du suffixe de test, pour deux raisons :
  - le fichier peut vivre dans un sous-dossier alors que son test est au premier niveau ;
  - le suffixe de test n'est pas le même partout.

  La comparaison détecte les deux sens :
  - un read-model sans test ;
  - un test dont aucun read-model ne porte le nom, ce qui attrape la faute de frappe dans un nom de
    fichier de test.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **RM3**, en avertissement, pour produire la liste des fichiers à classer
2. **X1 classement**, fichier par fichier, par les quatre tests du discriminant de
   `../objet-valeur/README.md`
3. **RM3 en `error`**, une fois la liste vidée
4. **RM4 + existence des tests**, un seul script de complétude
5. **RM2 signal**, dernier, son bénéfice étant le plus faible

### Corriger les violations

Critère de découpe : un codemod peut appliquer une décision, il ne peut pas en prendre une.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X1** classement | préparation seule | Déplacer un fichier et réécrire ses imports, oui. Décider s'il est Value Object ou read-model, non |
| **RM1** règle métier déplacée | non | Décider où la règle vit dans le domaine est de la conception |

Sur X1, un codemod ne doit pas « corriger » un objet reclassé en Value Object en lui ajoutant une
validation vide. Le lint passerait au vert, et la dette deviendrait invisible. Le codemod produit un
`TODO` et un squelette.

---

## Vérifier par le typage

Forme cible, après migration en TypeScript. Les contraintes de syntaxe imposées par la configuration
sont dans `../migration-typescript.md`.

Un read-model se déclare comme un **type structurel** :

```ts
export type PlacesStatistics = {
  readonly id: string;
  readonly total: number;
  readonly occupied: number;
};
```

**Code.** Hypothétique : aucun read-model n'est encore migré en `.ts`.

La raison de ce choix, l'inverse de celui du Value Object, est dans
[`explication.md`](explication.md#pourquoi-un-type-structurel).

`readonly` est effacé à la compilation : il empêche l'écriture au typage, pas à l'exécution. Si
l'immuabilité doit tenir à l'exécution, elle repose sur les champs privés d'une classe. C'est `X3` de
[`ecarts.md`](ecarts.md) : une convention, pas une nécessité.

Une dérivation de présentation sur un type structurel se déclare comme une fonction séparée, pas comme
un accesseur :

```ts
export const available = (s: PlacesStatistics): number => Math.max(0, s.total - s.occupied);
```

**Code.** Hypothétique.
