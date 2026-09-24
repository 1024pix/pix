# Aggregate Root — outillage

Guide pratique : mettre en place les vérifications automatiques des règles de
[`README.md`](README.md), et corriger les violations qu'elles relèvent.

## État au 2026-09-24

Aucune de ces vérifications n'est en place. Aucun plugin ESLint maison n'existe : toute règle sur
mesure suppose d'abord de créer cette infrastructure, et les coûts ci-dessous ne comptent que la
règle.

Presque tout ici demande de savoir ce qui appartient à la même frontière. Cette information n'est
écrite nulle part : c'est `X2` de [`ecarts.md`](ecarts.md#x2-aucune-racine-nest-déclarée-nulle-part).

## Vérifications

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **A2** point d'entrée unique | règle ESLint : accesseur rendant un champ privé de type tableau | ~30 lignes | faibles |
| **A3** un repository par racine | script `tests/tooling/` : rapport du nombre de repositories au nombre de racines déclarées | ~30 lignes | c'est un **indicateur**, pas une règle. Incalculable avant X2 |
| **A1** frontière explicite | revue, sur la phrase déclarée | — | impossible avant X2 |
| **A6** petit Aggregate, **A7** une transaction, un Aggregate | revue | — | — |
| Invariants hérités | voir `../entite/outillage.md` | — | — |

### A2 — la seule règle nette

Un accesseur qui rend directement une collection interne casse le point d'entrée unique, et c'est
décidable localement.

C'est la même règle que `V7` de `../objet-valeur/README.md` : une seule implémentation couvre les
deux. Elle n'a pas besoin de savoir si le fichier est une racine, un Value Object ou une Entity. Rendre
une collection interne modifiable est fautif dans les trois cas.

### A3 — un indicateur, pas une règle

Compter les repositories d'un contexte et les comparer aux racines déclarées ne produit pas un
verdict mais un **chiffre à regarder**. Un écart important est un signal de conception.

Prérequis : que les racines soient déclarées. Elles ne le sont pas : c'est X2.

### Ce qui n'est pas mécanisable, et pourquoi

A1, A6 et A7 demandent de connaître la frontière de cohérence. Elle n'est écrite nulle part dans le
code, et aucune analyse statique ne peut la déduire.

Ce n'est pas une limite de l'outillage mais une absence d'information. La conséquence pratique est
l'ordre ci-dessous : la déclaration précède l'outillage.

A1 n'est contrôlable que si la phrase de frontière est écrite quelque part. Elle ne l'est nulle part
à cette date : c'est X2.

### Tests attendus — existence du fichier

L'existence du fichier de test d'une racine se vérifie en comparant les noms. Moyens et limites dans
`../entite/outillage.md`.

### Pièges d'implémentation

- L'indicateur de A3 calculé avant X2 : le rapport compare alors un nombre de repositories à zéro
  racine déclarée, ce qui ne produit rien de lisible.
- Le codemod de X1 lancé avant le classement de chaque fichier par le
  [test de discrimination](README.md#le-test-de-discrimination) : il applique une décision qui n'a
  pas encore été prise, et déplace au hasard.
- La règle ESLint de A2 écrite sans mutualisation avec `V7` de `../objet-valeur/README.md` : la même
  vérification finit dupliquée dans deux dossiers.

### Ordre de mise en œuvre

L'ordre suit le coût et les dépendances entre points, pas le ROI de
[`explication.md`](explication.md#roi-des-invariants) : A1, le plus rentable, vient en dernier parce
qu'il dépend de X2.

1. **X2** : déclarer les racines et leur invariant de frontière, par contexte
2. **X1** : appliquer le test de discrimination aux dossiers `aggregates/` et renommer selon le
   résultat
3. **A2** : la règle ESLint, mutualisée avec V7
4. **A3** : le script d'indicateur, une fois X2 fait
5. **A1** : la revue devient possible, sur la phrase déclarée

Les deux premiers points ne sont pas de l'outillage.

### Corriger les violations

Sans objet pour les codemods, à une exception près. Déplacer une frontière est de la modélisation, et
aucun codemod ne peut décider si un objet a une règle commune.

L'exception est X1 : une fois le classement fait, déplacer un fichier de `aggregates/` vers
`read-models/` et réécrire ses imports est mécanique. Le codemod applique la décision, il ne la prend
pas.

Pour l'exemple fautif de A2, `CombinedCourse`, la correction est courte : la racine expose déjà deux
comptages dérivés, qui remplacent l'accès à la collection. Passer le champ en `#participations` privé
suffit.

---

## Vérifier par le typage

Le typage aide peu : une frontière de cohérence n'est pas une propriété de type. Voir
[`explication.md`](explication.md#le-typage-aide-peu). Deux points où il apporte quand même quelque
chose.

**E7 devient lisible dans la signature.** `organizationId: number` plutôt qu'`organization:
Organization` est visible à la lecture, donc revu. Des identifiants typés feraient de la confusion
entre deux identifiants une erreur de compilation, mais l'ADR 19 les a écartés pour leur coût.

**A2 se rapproche.** `readonly items: readonly Item[]` empêche la modification par l'appelant au
typage. Mais `readonly` est effacé à la compilation : la protection est statique seulement, et la
copie à l'accesseur reste nécessaire pour tout appelant JavaScript. A2 repose sur la copie, pas sur le
type.

La forme retenue est la classe, comme pour toute Entity : voir `../entite/outillage.md`. Les
contraintes de syntaxe imposées par la configuration sont dans `../migration-typescript.md`.
