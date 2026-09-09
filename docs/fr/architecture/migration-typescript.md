# Migration TypeScript — ce qui bloque le typage

État au 2026-09-08. **Ce fichier se périme.** Les fiches non : elles décrivent l'état cible, où tout
est en TypeScript. Ce document porte ce qui empêche aujourd'hui ce typage de vérifier quoi que ce
soit, et dans quel ordre migrer.

Une fiche renvoie ici plutôt que de décrire un obstacle transitoire.

---

## Le typage ne vérifie rien tant que la chaîne n'est pas complète

`api/src/types/js-modules.d.ts` déclare `declare module '*.js';`. Tout import d'un `.js` depuis un
`.ts` a donc le type `any`. `allowJs: false` et `checkJs: false` complètent le tableau : aucun fichier
JavaScript n'est analysé.

Conséquence sur un port. Un port `.ts` qui importe son modèle depuis un `.js` déclare
`Promise<any | null>` : il compile, il ne vérifie rien.

La propriété se propage. Un modèle en `.ts` qui importe un objet-valeur en `.js` reste partiellement
`any`. Un type ne vérifie quelque chose que si la chaîne complète, du port jusqu'aux types feuilles,
est en `.ts`.

## Ordre de migration d'une chaîne de repository

1. les **feuilles du graphe de types** — ce que les modèles importent : objets-valeurs, énumérations,
   erreurs du domaine ;
2. les modèles du domaine, sans quoi les invariants d'entrée et de sortie d'un repository restent
   inexprimables ;
3. les ports dans `domain/ports/` ;
4. les repositories, annotés contre leur port.

L'ordre inverse produit un typage vert qui ne garantit rien.

**Borne.** Cet ordre contraint la chaîne d'un repository. Il ne décide pas de l'ordre de migration de
l'API, qui répond à d'autres critères.

## Ce que la configuration interdit d'écrire

`erasableSyntaxOnly` interdit les propriétés de paramètre de constructeur, `enum`, les `namespace`
porteurs de code et `import x = require(…)`. Les `declare enum` et les namespaces de types restent
autorisés.

Toute forme de conformité retenue dans une fiche doit s'effacer intégralement au type stripping. C'est
ce qui écarte l'assertion `satisfies` sur un module entier : sous `verbatimModuleSyntax`, l'import de
namespace est un import de valeur, et l'instruction qui porte l'assertion survit.

## Ce qui est inerte sous la configuration actuelle

Les types conditionnels de l'utilitaire d'injection sont des annotations JSDoc dans un fichier `.js`.
Avec `allowJs: false`, `checkJs: false` et `declare module '*.js'`, le compilateur ne les lit pas. Ils
ne peuvent donc servir d'argument dans aucun sens sur la forme d'injection.

## À retirer quand la migration est faite

Ce document disparaît quand `declare module '*.js'` disparaît. Les sections « ordre de migration » et
« ce qui est inerte » n'ont plus d'objet à ce moment-là. La section sur `erasableSyntaxOnly` reste
valable tant que l'option est active : à ce moment-là, elle rejoint une convention TypeScript
transverse, pas une fiche.
