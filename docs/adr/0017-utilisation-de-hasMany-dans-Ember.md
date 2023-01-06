# 17. Utilisation de `hasMany` avec les filtres et pagination dans Ember

Date : 2021-01-12

## État

Accepted

## Contexte

Lorsqu'on utilise `hasMany` dans un modèle Ember, Ember fait l'hypothèse qu'il manipule une collection complète.
C'est la raison pour laquelle il n'existe pas de méthode `query` sur les relations `hasMany`.

Le problème des `hasMany` filtrés/paginés est que la collection associée se retrouve à ne pas contenir un reflet fiable de ce que contient la base mais une vue arbitrairement limitée en fonction des paginations/filtres qui viennent d'être faits.

Par conséquent, le code qui fait une hypothèse différente se retrouve induit en erreur.

## Décision

Aucune collection nécessitant d'être filtrée et ou paginée ne doit être une relation de type `hasMany`, mais un modèle classique que l'on récupère via la méthode `query`.
Il faut donc écrire la méthode `urlForQuery` dans l'adapter.

## Liens

- [Exemple de refactoring supprimant une relation `hasMany`](https://github.com/1024pix/pix/pull/2370)
- [Exemple de méthode `urlForQuery`](https://github.com/1024pix/pix/blob/58b480eef06c82273b7ee64a722a453befeaac95/admin/app/adapters/organization.js#L5-L11)
