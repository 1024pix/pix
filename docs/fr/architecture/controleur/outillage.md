# Contrôleur — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Aucun plugin ESLint maison n'existe : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle. Les taux de faux positifs de la table sont estimés, pas mesurés.

## Vérifications

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **C4** aucun accès aux données | règle `dependency-cruiser` : `application/**` ne dépend pas de `infrastructure/repositories/**` | configuration seule | aucun |
| **C4** frontière de contexte | règle `dependency-cruiser` : aucune dépendance vers le domaine d'un **autre** contexte | configuration | aucun, si « un autre contexte » est bien exprimé |
| **C1** un seul usecase | règle ESLint : plus d'un appel sur `usecases` dans une fonction de contrôleur | ~30 lignes | faibles : le cas « écriture puis lecture » |
| **C2** aucune décision | règle ESLint : `.code()` avec un littéral supérieur ou égal à 400 | ~20 lignes | **à mesurer** |
| **C5** nommage | script `tests/tooling/` : nom du fichier et de l'objet exporté | ~20 lignes | aucun |
| **C3** dépendances en paramètre | revue | — | — |

### C4 — règles de chemin

C'est la vérification la plus rentable, et elle est en configuration.

```js
{
  name: 'controller-must-not-access-repositories',
  severity: 'error',
  from: { path: 'src/.+/application/' },
  to: { path: 'src/.+/infrastructure/repositories/' },
}
```

`severity: 'error'` est obligatoire : la valeur par défaut est `warn`, et seul `error` fait échouer la
commande. Le chemin s'écrit `src/.+/` et non `src/[^/]+/`. Sinon, les contextes à sous-contextes ne
sont pas atteints, et la règle ne se déclenche jamais, sans le signaler. La contre-épreuve est
obligatoire.

La seconde règle, sur la frontière de contexte, est la même que `U9` de `../usecase/README.md`. Elle a
la même difficulté : exprimer « un autre contexte que le sien ». Une seule configuration couvre les
deux couches.

### C1 — compter les appels de usecase

La règle est décidable localement. Elle compte les appels de méthode sur l'identifiant `usecases`
dans le corps d'une fonction exportée d'un fichier de contrôleur. Au-delà d'un appel, elle signale.

Le cas « écriture puis lecture » produit un faux positif attendu. Il se traite **par exclusion
nominative**, pas en affaiblissant la règle. Une liste de fonctions exemptées, courte et relue, vaut
mieux qu'un seuil à deux, qui laisserait passer les vrais cas.

### C2 — les codes d'erreur

Un `.code()` avec un littéral supérieur ou égal à 400 dans un contrôleur est un signal fiable.

Les chemins qui ne passent pas par le domaine peuvent produire un faux positif, par exemple un
téléversement trop volumineux. Ces chemins doivent être exclus explicitement. Le code de **succès**
n'est pas concerné : la règle ne porte que sur le seuil 400.

### Ordre de mise en œuvre

Cet ordre suit le coût, pas le ROI : voir [`explication.md`](explication.md#roi-des-invariants).

1. **C4** : les deux règles de chemin, mutualisées avec `../usecase/`
2. **C5** : script de nommage
3. **C2** : règle ESLint, après mesure des chemins hors domaine
4. **C1** : règle ESLint, avec sa liste d'exclusion

### Corriger les violations

Peu d'écarts se prêtent à un codemod, ce qui est cohérent avec la nature de la couche.

| Écart | Codemod | Ce qu'il fait |
| --- | --- | --- |
| **X3** accès direct | partiel | Remplacer un appel de repository par un appel de usecase existant, oui. Écrire le usecase manquant, non |
| **X1** deux usecases | non | Trouver le nom de l'intention composée est de la conception |
| **X2** code d'erreur | non | Choisir l'erreur de domaine détermine le code HTTP et le code d'erreur |

Les écarts sont décrits dans [`ecarts.md`](ecarts.md).

---

## Vérifier par le typage

Forme cible, qui type le troisième paramètre et rend vérifiables les appels sur les usecases. Le gain
attendu est discuté dans [`explication.md`](explication.md#le-typage).

```ts
const getQuestResults = async function (
  request: Request,
  h: ResponseToolkit,
  dependencies = { questResultSerializer },
) { … }
```

**Code.** Forme hypothétique, dérivée de [`quest-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/application/quest-controller.js#L7).

Le contrôleur est un candidat **tardif** : il est en bout de chaîne, donc son typage ne vérifie rien
tant que les usecases et les sérialiseurs sont en JavaScript.

Les contraintes de syntaxe imposées par la configuration sont dans `../migration-typescript.md`.
