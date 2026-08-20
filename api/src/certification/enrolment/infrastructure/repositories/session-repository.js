import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { Candidate } from '../../domain/models/Candidate.js';
import { SessionEnrolment } from '../../domain/models/SessionEnrolment.js';

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<SessionEnrolment|null>} the session, or null when no session was found
 */
export async function get({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const foundSession = await knexConn
    .select({
      id: 'sessions.id',
      invigilatorPassword: 'sessions.invigilatorPassword',
      accessCode: 'sessions.accessCode',
      date: 'sessions.date',
      time: 'sessions.time',
      address: 'sessions.address',
      room: 'sessions.room',
      examiner: 'sessions.examiner',
      description: 'sessions.description',
      version: 'sessions.version',
      finalizedAt: 'sessions.finalizedAt',
      createdBy: 'sessions.createdBy',
      certificationCenter: 'certification-centers.name',
      certificationCenterId: 'certification-centers.id',
      certificationCenterType: 'certification-centers.type',
      candidatesData: knexConn
        .select(
          knexConn.raw(`
        json_agg(json_build_object(
          'id', "certification-candidates"."id",
          'firstName', "certification-candidates"."firstName",
          'lastName', "certification-candidates"."lastName",
          'sex', "certification-candidates"."sex",
          'birthPostalCode', "certification-candidates"."birthPostalCode",
          'birthINSEECode', "certification-candidates"."birthINSEECode",
          'birthCity', "certification-candidates"."birthCity",
          'birthProvinceCode', "certification-candidates"."birthProvinceCode",
          'birthCountry', "certification-candidates"."birthCountry",
          'email', "certification-candidates"."email",
          'resultRecipientEmail', "certification-candidates"."resultRecipientEmail",
          'externalId', "certification-candidates"."externalId",
          'birthdate', "certification-candidates"."birthdate",
          'extraTimePercentage', "certification-candidates"."extraTimePercentage",
          'createdAt', "certification-candidates"."createdAt",
          'userId', "certification-candidates"."userId",
          'reconciledAt', "certification-candidates"."reconciledAt",
          'organizationLearnerId', "certification-candidates"."organizationLearnerId",
          'subscription', "certification-candidates"."subscription",
          'hasSeenCertificationInstructions', "certification-candidates"."hasSeenCertificationInstructions",
          'accessibilityAdjustmentNeeded', "certification-candidates"."accessibilityAdjustmentNeeded",
          'billingMode', "certification-candidates"."billingMode",
          'prepaymentCode', "certification-candidates"."prepaymentCode",
          'certificationId', "certification-courses"."id"
        ) order by "certification-candidates"."id")
    `),
        )
        .from('certification-candidates')
        .leftJoin('certification-courses', 'certification-courses.candidateId', 'certification-candidates.id')
        .whereRaw('"certification-candidates"."sessionId" = sessions.id'),
    })
    .from('sessions')
    .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
    .where('sessions.id', id)
    .first();

  if (!foundSession) {
    return null;
  }

  const certificationCandidates =
    foundSession?.candidatesData?.map(
      (candidateData) =>
        new Candidate({
          ...candidateData,
          sessionId: foundSession.id,
          extraTimePercentage:
            candidateData.extraTimePercentage != null ? parseFloat(candidateData.extraTimePercentage) : null,
          createdAt: new Date(candidateData.createdAt),
          reconciledAt: candidateData.reconciledAt ? new Date(candidateData.reconciledAt) : null,
          hasStartedTest: !!candidateData.certificationId,
          hasSeenCertificationInstructions: !!candidateData.hasSeenCertificationInstructions,
          accessibilityAdjustmentNeeded: !!candidateData.accessibilityAdjustmentNeeded,
        }),
    ) ?? [];
  return new SessionEnrolment({ ...foundSession, certificationCandidates });
}

/**
 * @function
 * @param {object} params
 * @param {string} params.address
 * @param {string} params.room
 * @param {Date} params.date
 * @param {Date} params.time
 * @param {number} params.certificationCenterId
 * @param {number} [params.excludeSessionId]
 * @returns {Promise<boolean>}
 */
export async function isSessionExistingByCertificationCenterId({
  address,
  room,
  date,
  time,
  certificationCenterId,
  excludeSessionId,
}) {
  const knexConn = DomainTransaction.getConnection();
  const query = knexConn('sessions').where({ address, room, date, time }).andWhere({ certificationCenterId });
  if (excludeSessionId) {
    query.andWhereNot({ id: excludeSessionId });
  }
  const sessions = await query;
  return sessions.length > 0;
}

/**
 * @param {object} params
 * @param {number} params.userId
 * @param {certificationCenterId} params.certificationCenterId
 * @param {string} params.address
 * @param {string} params.room
 * @param {string} params.date
 * @param {string} params.time
 * @param {string} params.examiner
 * @param {string} params.description
 * @param {string} params.accessCode
 * @param {string} params.invigilatorPassword
 * @returns {Promise<void>}
 */
export async function create({
  userId,
  certificationCenterId,
  address,
  room,
  examiner,
  date,
  time,
  description,
  accessCode,
  invigilatorPassword,
}) {
  const knexConn = DomainTransaction.getConnection();
  const [certificationCenter] = await knexConn
    .pluck('name')
    .from('certification-centers')
    .where({ id: certificationCenterId });
  const [{ id }] = await knexConn('sessions')
    .insert({
      createdBy: userId,
      certificationCenterId,
      address,
      room,
      examiner,
      date,
      time,
      description,
      accessCode,
      invigilatorPassword,
      certificationCenter,
      version: AlgorithmEngineVersion.V3,
    })
    .returning('id');
  return id;
}

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @param {string} params.address
 * @param {string} params.room
 * @param {string} params.date
 * @param {string} params.time
 * @param {string} params.examiner
 * @param {string} params.description
 * @returns {Promise<void>}
 */
export async function updateInfo({ id, address, room, examiner, date, time, description }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('sessions').where({ id }).update({ address, room, examiner, date, time, description });
}

/**
 * @function
 * @param {object} params
 * @param {number} params.id
 * @returns {Promise<number|null>} the number of deleted sessions, or null when no session was found
 */
export async function remove({ id }) {
  const knexConn = DomainTransaction.getConnection();
  await knexConn('invigilator_accesses').where({ sessionId: id }).del();
  await knexConn('certification-candidates').where({ sessionId: id }).del();
  const nbSessionsDeleted = await knexConn('sessions').where({ id }).del();

  if (nbSessionsDeleted === 0) {
    return null;
  }

  return nbSessionsDeleted;
}
