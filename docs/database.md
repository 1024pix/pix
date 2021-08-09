# Conventions

## Nommage

### Tables

Le nom d'une table :

- est au pluriel : `users` au lieu de  `user`;
- suivant sa nature :
  - pour les entités, est au format kebab-case : `certification-centers` au lieu de `certificationCenters`;
  - pour les relations, est au format snake_case pour les relations, ex: `user_tutorials` pour la relation entre `users`
    et `tutorials`.

Les règles sont cumulables : `target-profiles_skills` est valide pour les relations entre `target-profiles` et `skills`.

#### Exceptions

Les exceptions possibles sont :

- les tables utilisées par les libraires, par exemple la table `knex_migrations` utilisée par la librairie `knex`.

Dans ce cas, elles peuvent être ajoutées à
la [whitelist](../api/tests/acceptance/database/whitelist/table-name-casing.js).

### Colonnes

Le nom d'une colonne :

- est au format camelCase : `userId` au lieu de  `user_id`;
- est au singulier : `email` au lieu de `emails` (si la cardinalité est 1:N, créer une table de relation).

Suivant le rôle de la colonne, des règles supplémentaires s'appliquent :

- si c'est un identifiant couplé à une séquence, jouant le rôle de clef primaire, elle est nommée `id`;
- si c'est une clef étrangère vers un identifiant technique, elle est au singulier et suffixée par `id`, ex `userId`
  référence `users.id`.

#### Exceptions

Les exceptions possibles sont :

- la mention d'acronymes ou de sigles, ex: `INSEECode`.

Dans ce cas, elles peuvent être ajoutées à
la [whitelist](../api/tests/acceptance/database/whitelist/column-name-casing.js).
