const engineeringUserId = process.env.ENGINEERING_USER_ID;

const up = async function (knex) {
  //Avoid fail migration when engineering user does not exist.
  if (!engineeringUserId) return;
  const user = await knex
    .from('users')
    .where({ id: parseInt(engineeringUserId) })
    .first();
  if (!user) return;
  await knex('organization-learner-import-formats').insert({
    name: 'ONDE',
    fileType: 'csv',
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
          { name: 'Date de naissance', type: 'date', format: 'DD/MM/YYYY', required: true },
        ],
      },
      headers: [
        { name: 'Nom élève', property: 'lastName', required: true },
        { name: 'Prénom élève', property: 'firstName', required: true },
        { name: 'INE', required: true },
        { name: 'Niveau', required: true },
        { name: 'Libellé classe', required: true },
        { name: 'Date de naissance', required: true },
      ],
    },
    createdAt: new Date(),
    createdBy: parseInt(engineeringUserId),
    updatedAt: new Date(),
  });
};

const down = async function (knex) {
  await knex('organization-learner-import-formats').where({ name: 'ONDE' }).delete();
};

export { down, up };
