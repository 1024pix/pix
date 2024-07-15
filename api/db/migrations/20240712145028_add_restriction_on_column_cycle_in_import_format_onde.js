const up = async function (knex) {
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
    });
};

const down = async function (knex) {
  await knex('organization-learner-import-formats')
    .where({ name: 'ONDE' })
    .update({
      config: {
        acceptedEncoding: ['utf8'],
        unicityColumns: ['INE'],
        validationRules: {
          formats: [
            { name: 'Nom élève', type: 'string', required: true },
            { name: 'Prénom élève', type: 'string', required: true },
            { name: 'INE', type: 'string', required: true },
            { name: 'Niveau', type: 'string', required: true },
            { name: 'Libellé classe', type: 'string', required: true },
            { name: 'Date naissance', type: 'date', format: 'DD/MM/YYYY', required: true },
          ],
        },
        headers: [
          { name: 'Nom élève', property: 'lastName', required: true },
          { name: 'Prénom élève', property: 'firstName', required: true },
          { name: 'INE', required: true },
          { name: 'Niveau', required: true },
          { name: 'Libellé classe', required: true },
          { name: 'Date naissance', required: true },
        ],
      },
    });
};

export { down, up };
