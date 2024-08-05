const up = async function (knex) {
  await knex('organization-learner-import-formats')
    .where({ name: 'ONDE' })
    .update({
      config: {
        acceptedEncoding: ['iso-8859-1', 'utf8'],
        unicityColumns: ['INE'],
        validationRules: {
          formats: [
            { key: 1, name: 'Nom élève', type: 'string', required: true },
            { key: 2, name: 'Prénom élève', type: 'string', required: true },
            { key: 3, name: 'INE', type: 'string', required: true },
            { key: 5, name: 'Niveau', type: 'string', expectedValues: ['CM1', 'CM2'], required: true },
            { key: 6, name: 'Libellé classe', type: 'string', required: true },
            { key: 7, name: 'Date naissance', type: 'date', format: 'YYYY-MM-DD', required: true },
            { key: 4, name: 'Cycle', type: 'string', expectedValues: ['CYCLE III'], required: true },
          ],
        },
        headers: [
          { key: 1, name: 'Nom élève', property: 'lastName', required: true },
          { key: 2, name: 'Prénom élève', property: 'firstName', required: true },
          { key: 3, name: 'INE', required: true },
          { key: 4, name: 'Cycle', required: true },
          { key: 5, name: 'Niveau', required: true },
          { key: 6, name: 'Libellé classe', required: true },
          { key: 7, name: 'Date naissance', required: true },
        ],
      },
      updatedAt: new Date(),
    });
};

const down = async function (knex) {
  await knex('organization-learner-import-formats')
    .where({ name: 'ONDE' })
    .update({
      config: {
        acceptedEncoding: ['iso-8859-1', 'utf8'],
        unicityColumns: ['INE'],
        validationRules: {
          formats: [
            { name: 'Nom élève', type: 'string', required: true },
            { name: 'Prénom élève', type: 'string', required: true },
            { name: 'INE', type: 'string', required: true },
            { name: 'Niveau', type: 'string', expectedValues: ['CM1', 'CM2'], required: true },
            { name: 'Libellé classe', type: 'string', required: true },
            { name: 'Date naissance', type: 'date', format: 'YYYY-MM-DD', required: true },
            { name: 'Cycle', type: 'string', expectedValues: ['CYCLE III'], required: true },
          ],
        },
        headers: [
          { name: 'Nom élève', property: 'lastName', required: true },
          { name: 'Prénom élève', property: 'firstName', required: true },
          { name: 'INE', required: true },
          { name: 'Cycle', required: true },
          { name: 'Niveau', required: true },
          { name: 'Libellé classe', required: true },
          { name: 'Date naissance', required: true },
        ],
      },
      updatedAt: new Date(),
    });
};

export { down, up };
