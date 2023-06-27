import { knex } from '../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../domain/errors.js';
import { Session } from '../../../domain/models/Session.js';
import { CertificationCenter } from '../../../domain/models/CertificationCenter.js';

const get = async function (sessionId) {
  const foundSession = await knex.select('*').from('sessions').where({ id: sessionId }).first();
  if (!foundSession) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
  return new Session({ ...foundSession });
};

const isSco = async function ({ sessionId }) {
  const result = await knex
    .select('certification-centers.type')
    .from('sessions')
    .where('sessions.id', '=', sessionId)
    .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .first();

  return result.type === CertificationCenter.types.SCO;
};

export { get, isSco };
