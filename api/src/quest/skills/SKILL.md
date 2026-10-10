---
name: migrate-quest-model-to-ts
description: Migre un modèle JavaScript du scope /quest (api/src/quest/domain/models) vers TypeScript en respectant les règles de l'équipe, et s'arrête avec une EXCEPTION codée quand une migration n'est pas sûre.
---

# Migration d'un modèle JS → TS (scope /quest)

Objectif : convertir **un modèle à la fois** de `api/src/quest/domain/models/**/*.js` en `.ts`, sans changer son comportement ni son API publique.

## Entrées

- `cible` : nom du modèle (`Quest`) ou chemin du fichier. Plusieurs cibles → les traiter une par une, avec un rapport par fichier.
- `règles` (optionnel) : surcharges passées par l'utilisateur, ex. `skip=Eligibility`.
- `ignore=<CODE>:<Modèle>` (optionnel, répétable) : ne pas lever l'exception <CODE> pour ce modèle, et appliquer à la place le comportement prévu dans la colonne « Si ignorée » du tableau des exceptions.
  Ex. : `/migrate-quest-model-to-ts CombinedCourseBlueprintItem ignore=AMBIGUOUS_TYPES:CombinedCourseBlueprintItem`

**Priorité des règles** : règles données dans le message > règles par défaut ci-dessous. Annoncer en une ligne les règles effectivement appliquées avant de commencer.

## Règles par défaut

- R1 — Scope : seuls les fichiers dont le chemin contient `/quest/` sont modifiables. Les fichiers hors scope peuvent être lus, jamais modifiés (sauf leurs imports, cf. R7).
- R2 — Aucune modification de comportement : même logique, mêmes valeurs par défaut, mêmes erreurs levées, même ordre des opérations.
- R3 — API publique inchangée : noms de classe, de méthodes, de getters et d'exports identiques.
- R4 — Pas d'any.
- R5 — Pas d'enum. Utiliser des unions de littéraux.
- R6 - Pas d'unknown ni d'unknown[]. 
- R7 — Typer le constructeur via un type nommé `<Modèle>Args` (paramètre objet déstructuré), exporté seulement si importé dans d'autres fichiers.
- R8 — Mettre à jour les imports des fichiers qui consomment le modèle en suivant la convention des fichiers `.ts` déjà présents dans le repo (regarder d'abord un modèle déjà migré et l'imiter).
- R9 — `git mv` du `.js` vers `.ts` pour conserver l'historique, puis modifier.
- R10 — Transformer les tests unitaires en .js des models en fichiers .ts dans la même passe mais ne pas migrer les tests d'intégration ni les tests d'acceptance.
- R11 - S'il y a des constantes à migrer, s'inspirer de ce qui a été fait dans `api/src/quest/domain/constants.ts` et laisser les constantes disponibles dans leur fichier js d'origine.
- R12 — Pas de types génériques (`class X<T>`, `type XArgs<T>`). Si un attribut hérité d'une classe parente change de type selon la classe fille, lever `AMBIGUOUS_TYPES`.

## Exceptions (conditions d'arrêt)

Quand une de ces situations se présente : **arrêter la migration de ce fichier**, ne rien laisser à moitié modifié (annuler les changements de ce fichier), et émettre le bloc suivant, puis passer à la cible suivante s'il y en a une :

```
EXCEPTION <CODE>
fichier : <chemin>
raison  : <une phrase factuelle>
preuve  : <extrait de code ou sortie de commande>
sortie possible : <règle à ajouter ou décision attendue de l'utilisateur>
```

| Code | Déclencheur | Si ignorée |
|---|---|
| `OUT_OF_SCOPE` | La cible n'est pas sous `/quest/`, ou la migration exige de modifier autre chose que des imports hors scope. | | Non ignorable. |
| `SKIPPED_BY_RULE` | La cible est listée dans `skip=`. | | Non ignorable. |
| `TESTS_RED_BEFORE` | Les tests du modèle échouent **avant** toute modification. | | Non ignorable. |
| `DYNAMIC_SHAPE` | Le modèle construit des propriétés dynamiquement (`this[key] = …`, `Object.assign(this, data)` sans schéma connu) et le type ne peut pas être déduit sans deviner. | | Non ignorable. |
| `ANY_REQUIRED` | Typage impossible sans `any`. | | Non ignorable. |
| `UNKNOWN_REQUIRED` | Typage impossible sans `unknown`. | | Non ignorable. |
| `CHECK_FAILED` | Typecheck, lint ou tests en échec après 2 tentatives de correction. | | Non ignorable. |
| `AMBIGUOUS_TYPES` | Une fois `null` et `undefined` retirés, un attribut de la classe porte encore au moins deux types différents. Exemples : `string \| number` ou `string \| number \| null` → exception ; `string \| undefined` ou `string \| null` → pas d'exception, typer normalement. | | Typer l'attribut avec l'union explicite (ex. `string \| number`), sans type générique. |
| `BREAKING_API` | Respecter TS imposerait de changer l'API publique (R3) ou le comportement (R2). | | Non ignorable. |

Ne jamais contourner une exception par `// @ts-ignore`, `@ts-expect-error`, un cast `as unknown as X` ou la désactivation d'une règle de lint.

## Déroulé

1. **Vérifier le scope** et les règles `skip` → sinon `EXCEPTION`.
2. **Lire** : le modèle, ses tests unitaires, ses usages (`grep` du nom de classe et du chemin d'import dans `api/src` et `api/tests`), la factory du domainBuilder qui le construit, et un modèle `.ts` déjà migré comme référence de style. Détecter à cette étape, avant toute modification, les exceptions `THROW_ERROR_MODEL`, `AMBIGUOUS_TYPES` et `DYNAMIC_SHAPE`.
3. **Lancer les tests du modèle avant modification** → rouge : `TESTS_RED_BEFORE`.
4. **Migrer** : `git mv`, type `<Modèle>Args`, types des champs, des méthodes et des retours, en appliquant R1–R10.
5. **Migrer** les tests unitaires du modèle de js vers TS. 
5. **Mettre à jour les imports** des consommateurs (R7).
6. **Supprimer** les fichiers .js correspondants au model et au test unitaire du model.
7. **Vérifier**, dans cet ordre : typecheck (`tsc --noEmit` ou le script npm du projet), lint sur les fichiers touchés, tests unitaires du modèle, puis tests des consommateurs directs. Jusqu'à 2 tentatives de correction, sinon `CHECK_FAILED`.
8. **Rapport**.

## Rapport final (par fichier)

```
✅ <Modèle> migré — <chemin .ts>
Règles appliquées : <liste, avec les surcharges>
Fichiers modifiés : <liste>
Vérifications : typecheck ✔ · lint ✔ · tests ✔ (<n> tests)
Points d'attention : <types approximatifs, choix faits>
```

En fin de lot, récapituler : migrés / en exception (avec leur code) / ignorés.
