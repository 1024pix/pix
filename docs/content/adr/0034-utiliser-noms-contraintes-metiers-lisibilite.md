# 34. Nom des contraintes sur la base PG

Date : 2022-06-01

## État

En cours

## Contexte

Nous sommes amenés à générer des contraintes d'unicité entre plusieurs colonnes pour différents contextes métier. PG limite le nom des contraintes à 63 caractères.

La majorité des contraintes sont générées par `knex` (90% des cas).
Actuellement lorsque nous créons une contrainte spécifique, nous les appelons par le nom des colonnes qui la compose. Sauf que dans certains cas nous atteignons la limite des 63 caractères.
A savoir que peu importe le nom que nous donnons à notre contrainte elle sera tronqué si elle dépasse cette limite.

Nous avons eu deux incidents côté Prescription / Certification. Une contrainte utilisant des colonnes quasiment similaire mais une fois tronqué, les noms de contraintes étaient identique.

##### Exemple non contractuel
Deux contraintes d'unicité définies avec ces colonnes :
`'campaign_participations_campaignId_organizationLearnerId_isImproved_deletedAt_deletedBy_unique'`
`'campaign_participations_campaignId_organizationLearnerId_isImproved_participantExternalId_unique'`

Les noms qu'elles auront en base pour respecter la limite des 63 caractères sera identique, la seconde migration serait en échec :
`'campaign_participations_campaignId_organizationLearnerId_isI'`

### Solution 1 : Nommer les contraintes d'une manière métier et non technique

Au lieu de nommer les contraintes par le nom des colonnes qui la compose, nous suggérons de les nommer par l'intention métier qu'elle assure.

##### Exemple non contractuel

```sql
`CREATE UNIQUE INDEX <name> ON "campaign-participations" ("campaignId", "organizationLearnerId" ) WHERE "isImproved" IS FALSE AND "deletedAt" IS NULL AND "deletedBy" IS NULL;`
```

Une contrainte sur ces colonnes-là s'écrirait

- Avec la convention knex (94 caractères)
`'campaign_participations_campaignId_organizationLearnerId_isImproved_deletedAt_deletedBy_unique'`

- En utilisant le contexte métier (35 caractères)
`'one_active_participation_by_learner'`

```js
const OLD_UNIQUE_ORGANIZATION_ID_NATIONAL_APPRENTICE_ID_CONSTRAINT_NAME =
  'schooling_registrations_organizationid_nationalapprenticeid_uni';

const NEW_UNIQUE_ORGANIZATION_ID_NATIONAL_APPRENTICE_ID_CONSTRAINT_NAME =
  'organization_learners_organizationid_nationalapprenticeid_unique';
```

**Avantage(s):**

- Permet d'avoir une lecture simple de ce que la contrainte fait.
- Si des évolutions métiers font que la contrainte doit contenir une nouvelle colonne, pas besoin de renommer la contrainte pour contenir la nouvelle colonne.
- On limite la possibilité de dépassement des 63 caractères.
- Plus lisible dans le cas d'erreur en production.
- Réduction des risques de nommer des contraintes identiques.
- Ne pas devoir renommer des contraintes parce que la colonne/table a changé de nom.

**Inconvénient(s):**

- Gymnastique pas forcément innée pour les développeurs
- Nouvelle habitude à prendre 
- Pas de renommage des anciennes contraintes

### Solution 2 : Recompiler PG afin d'augmenter le max size des nom de contraintes

La longueur maximale du nom de contrainte est définie dans la constante NAMEDATALEN d'un fichier header C, donc sa valeur peut être modifiée, à condition de recompiler le code source.

https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS

Recompiler PG en augmentant la constante `max size` permettrait de gérer des nom de contraintes plus longs.

**Avantage(s):**

- laisser knex gérer le nommage des contraintes 
- problème de longueur "résolu"

**Inconvénient(s):**

- hébergement PaaS (nous n'avons pas la main sur cette variable d'environnement)
- recompiler PG

### Solution 3 : Générer les clés par hash

Générer le nom de la contrainte avec un hash

**inconvénient(s):** 

- hash non symétrique, donc prend du temps pour identifier la contrainte en cas de problème (se connecter à la BDD)

### Conclusion

La solution 2 est écartée car PGSql est hébergé par un tiers, nous ne pouvons donc effectuer l'action requise pour augmenter le max size des contraintes

La solution 3 est écartée pour une question de lisibilité/identification de la source du problème

La solution 1 semble la plus adaptée à notre contexte.

## Décision

Utiliser la solution n°1, en nommant les contraintes 

- manuellement
- en explicitant l'intention métier

On ne modifie pas le nom des contraintes déjà présentes.
## Conséquences

Nommer manuellement les contraintes (utiliser `knex.raw`)