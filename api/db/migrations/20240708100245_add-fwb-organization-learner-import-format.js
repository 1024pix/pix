const engineeringUserId = process.env.ENGINEERING_USER_ID;
const importFormatName = 'SCO-FWB';

const up = async function (knex) {
  //Avoid fail migration when engineering user does not exist.
  if (!engineeringUserId) return;
  const user = await knex
    .from('users')
    .where({ id: parseInt(engineeringUserId) })
    .first();
  if (!user) return;
  await knex('organization-learner-import-formats').insert({
    name: importFormatName,
    fileType: 'csv',
    config: {
      acceptedEncoding: ['utf8'],
      unicityColumns: ['Nom', 'Prénom', 'Date de naissance (jj/mm/aaaa)'],
      reconciliationMappingColumns: [
        { key: 'reconcileField1', columnName: 'Nom' },
        { key: 'reconcileField2', columnName: 'Prénom' },
        { key: 'reconcileField3', columnName: 'Date de naissance (jj/mm/aaaa)' },
      ],
      validationRules: {
        formats: [
          { name: 'Nom', type: 'string', required: true },
          { name: 'Prénom', type: 'string', required: true },
          { name: 'Date de naissance (jj/mm/aaaa)', type: 'date', format: 'DD/MM/YYYY', required: true },
          { name: 'Classe', type: 'string', required: true },
        ],
      },
      headers: [
        { name: 'Nom', property: 'lastName', required: true },
        { name: 'Prénom', property: 'firstName', required: true },
        { name: 'Date de naissance (jj/mm/aaaa)', required: true },
        { name: 'Classe', required: true },
      ],
    },
    createdAt: new Date(),
    createdBy: parseInt(engineeringUserId),
    updatedAt: new Date(),
  });
};

const down = async function (knex) {
  await knex('organization-learner-import-formats').where({ name: importFormatName }).delete();
};

export { down, up };
