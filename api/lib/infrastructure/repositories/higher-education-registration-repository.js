const _ = require('lodash');
const { knex } = require('../bookshelf');
const { getChunkSizeForParameterBinding } = require('../utils/knex-bookshelf-utils');

const ATTRIBUTES_TO_SAVE = [
  'firstName',
  'middleName',
  'thirdName',
  'lastName',
  'preferredLastName',
  'studentNumber',
  'email',
  'diploma',
  'department',
  'educationalTeam',
  'group',
  'status',
  'birthdate',
];

module.exports = {

  saveSet(higherEducationRegistrationSet, organizationId) {
    const registrationDataToSave = higherEducationRegistrationSet.registrations.map((registration) => {
      const registrationToSave = _.pick(registration, ATTRIBUTES_TO_SAVE);
      registrationToSave.status = registration.studyScheme;
      registrationToSave.organizationId = organizationId;
      return registrationToSave;
    });

    return upsert(registrationDataToSave);
  }
};

async function upsert(registrationDataToSave) {
  const chunkSize = getChunkSizeForParameterBinding(_.head(registrationDataToSave), ATTRIBUTES_TO_SAVE.length * 2 + 2);
  const registrationDataChunks = _.chunk(registrationDataToSave, chunkSize);
  for (const registrationDataChunk of registrationDataChunks) {
    await knex.raw('? ON CONFLICT (??, ??) DO UPDATE SET ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??, ?? = EXCLUDED.??', [
      knex('schooling-registrations').insert(registrationDataChunk),
      'organizationId', 'studentNumber',
      ATTRIBUTES_TO_SAVE[0], ATTRIBUTES_TO_SAVE[0],
      ATTRIBUTES_TO_SAVE[1], ATTRIBUTES_TO_SAVE[1],
      ATTRIBUTES_TO_SAVE[2], ATTRIBUTES_TO_SAVE[2],
      ATTRIBUTES_TO_SAVE[3], ATTRIBUTES_TO_SAVE[3],
      ATTRIBUTES_TO_SAVE[4], ATTRIBUTES_TO_SAVE[4],
      ATTRIBUTES_TO_SAVE[5], ATTRIBUTES_TO_SAVE[5],
      ATTRIBUTES_TO_SAVE[6], ATTRIBUTES_TO_SAVE[6],
      ATTRIBUTES_TO_SAVE[7], ATTRIBUTES_TO_SAVE[7],
      ATTRIBUTES_TO_SAVE[8], ATTRIBUTES_TO_SAVE[8],
      ATTRIBUTES_TO_SAVE[9], ATTRIBUTES_TO_SAVE[9],
      ATTRIBUTES_TO_SAVE[10], ATTRIBUTES_TO_SAVE[10],
      ATTRIBUTES_TO_SAVE[11], ATTRIBUTES_TO_SAVE[11],
      ATTRIBUTES_TO_SAVE[12], ATTRIBUTES_TO_SAVE[12],
    ]);
  }
}
