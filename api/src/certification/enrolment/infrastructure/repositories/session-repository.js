import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { CertificationCenter } from '../../../../../lib/domain/models/CertificationCenter.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { Session } from '../../../enrolment/domain/models/Session.js';

const save = async function ({ session, domainTransaction = DomainTransaction.emptyTransaction() }) {
  const knexConn = domainTransaction.knexTransaction ?? knex;
  session = _.omit(session, ['certificationCandidates']);
  const [savedSession] = await knexConn('sessions').insert(session).returning('*');

  return new Session(savedSession);
};

const get = async function ({ id }) {
  const foundSession = await knex.select('*').from('sessions').where({ id }).first();
  if (!foundSession) {
    throw new NotFoundError("La session n'existe pas ou son accès est restreint");
  }
  return new Session({ ...foundSession });
};

const isSessionExistingByCertificationCenterId = async function ({ address, room, date, time, certificationCenterId }) {
  const sessions = await knex('sessions').where({ address, room, date, time }).andWhere({ certificationCenterId });
  return sessions.length > 0;
};

const isSessionExistingBySessionAndCertificationCenterIds = async function ({ sessionId, certificationCenterId }) {
  const [session] = await knex('sessions').where({ id: sessionId, certificationCenterId });
  return Boolean(session);
};

const updateSessionInfo = async function ({ session }) {
  const sessionDataToUpdate = _.pick(session, [
    'address',
    'room',
    'accessCode',
    'examiner',
    'date',
    'time',
    'description',
  ]);

  const [updatedSession] = await knex('sessions').where({ id: session.id }).update(sessionDataToUpdate).returning('*');
  return new Session(updatedSession);
};

const isSco = async function ({ id }) {
  const result = await knex
    .select('certification-centers.type')
    .from('sessions')
    .where('sessions.id', '=', id)
    .innerJoin('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .first();

  return result.type === CertificationCenter.types.SCO;
};

const remove = async function ({ id }) {
  await knex.transaction(async (trx) => {
    const certificationCandidateIdsInSession = await knex('certification-candidates')
      .where({ sessionId: id })
      .pluck('id');
    const supervisorAccessIds = await knex('supervisor-accesses').where({ sessionId: id }).pluck('id');

    if (supervisorAccessIds) {
      await trx('supervisor-accesses').whereIn('id', supervisorAccessIds).del();
    }

    if (certificationCandidateIdsInSession.length) {
      await trx('certification-subscriptions')
        .whereIn('certificationCandidateId', certificationCandidateIdsInSession)
        .del();
      await trx('certification-candidates').whereIn('id', certificationCandidateIdsInSession).del();
    }
    const nbSessionsDeleted = await trx('sessions').where('id', id).del();
    if (nbSessionsDeleted === 0) throw new NotFoundError();
  });

  return;
};

export {
  get,
  isSco,
  isSessionExistingByCertificationCenterId,
  isSessionExistingBySessionAndCertificationCenterIds,
  remove,
  save,
  updateSessionInfo,
};
