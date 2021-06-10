const { knex } = require('../../../../db/knex-database-connection');
const { Session } = require('../../domain/models/Session');
const { AccessCode } = require('../../domain/models/AccessCode');

async function get(id) {
  const session = await knex('sessions')
    .select(
      'id',
      'certificationCenterId',
      'address',
      'room',
      'examiner',
      'date',
      'time',
      'description',
    )
    .select({
      'certificationCenterName': 'certificationCenter',
      'accessCodeValue': 'accessCode',
    })
    .where({ id }).first();
  if (!session) {
    throw new Error('La session n\'existe pas ou son accès est restreint');
  }
  session.time = session.time.substr(0, 5);
  const accessCode = new AccessCode({ value: session.accessCodeValue });
  return new Session({
    ...session,
    accessCode,
  });
}

async function save(session) {
  const sessionToSave = session.toDTO();
  sessionToSave.certificationCenter = sessionToSave.certificationCenterName;
  delete sessionToSave.certificationCenterName;
  if (!sessionToSave.id) delete sessionToSave.id;
  const returning = await knex('sessions')
    .insert(sessionToSave)
    .returning('id');
  return returning[0];
}

module.exports = {
  get,
  save,
};
