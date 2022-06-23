# Conventions

Ces conventions sont vérifiées dans la tâche de `lint` de l'API.

## Nommage

### Tables

Le nom d'une table :

- est au pluriel : `users` et pas `user`

#### Exceptions

Les exceptions possibles sont :

- les tables utilisées par les librairies, par exemple la table `knex_migrations_lock` utilisée par la librairie `knex`;
- les tables ne contenant qu'un seul enregistrement (aucun exemple connu).

Dans ce cas, elles peuvent être ajoutées à la propriété `ignores`
du [fichier de configuration](../api/tests/acceptance/database/configuration.js).

```javascript
  ignores: [
  {identifierPattern: 'public\\.knex*.*', rulePattern: '.*'},
  {identifierPattern: 'public\\.badge-criteria', rulePattern: 'name-inflection'},
]
```
