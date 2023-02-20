const autoResolveSentencePattern = 'Aucune question ne correspond au numéro %';

const autoResolveSentences = [
  'Cette question a été neutralisée automatiquement',
  "Cette question n'a pas été neutralisée car elle ne contient ni image ni application/simulateur",
  "Cette question n'a pas été neutralisée car elle ne contient pas de fichier à télécharger",
  "Cette question n'a pas été neutralisée car ce n'est pas une question focus",
  "Cette question n'a pas été neutralisée car elle n'est pas chronométrée",
  "Cette question n'a pas été neutralisée car la réponse est correcte",
  "Cette question n'a pas été neutralisée car la réponse n'a pas été abandonnée ou le focus n'a pas été perdu",
  'Cette réponse a été acceptée automatiquement',
];

export const up = async function (knex) {
  await knex.schema.table('certification-issue-reports', (table) => {
    table.boolean('hasBeenAutomaticallyResolved').nullable();
  });

  await knex('certification-issue-reports').whereNotNull('resolvedAt').update({ hasBeenAutomaticallyResolved: false });

  await knex('certification-issue-reports')
    .whereIn('resolution', autoResolveSentences)
    .orWhere('resolution', 'LIKE', autoResolveSentencePattern)
    .update({ hasBeenAutomaticallyResolved: true });
};

export const down = async function (knex) {
  await knex.schema.table('certification-issue-reports', (table) => {
    table.dropColumn('hasBeenAutomaticallyResolved');
  });
};
