
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const SessionForAttendanceSheet = require('../../domain/read-models/SessionForAttendanceSheet');
const CertificationCandidateForAttendanceSheet = require('../../domain/read-models/CertificationCandidateForAttendanceSheet');

module.exports = {

  async getWithCertificationCandidates(idSession) {

    const sessionCertificationCandidates = await knex('sessions')
      .select(
        'sessions.id',
        'sessions.date',
        'sessions.time',
        'sessions.address',
        'sessions.room',
        'sessions.examiner',
        'certification-centers.name as certificationCenterName',
        'certification-centers.type as certificationCenterType',
        'certification-candidates.lastName',
        'certification-candidates.firstName',
        'certification-candidates.birthdate',
        'certification-candidates.externalId',
        'certification-candidates.extraTimePercentage',
        'schooling-registrations.division',
      )
      .join('certification-centers', 'certification-centers.id', 'sessions.certificationCenterId')
      .leftJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
      .leftJoin('schooling-registrations', 'schooling-registrations.id', 'certification-candidates.schoolingRegistrationId')
      .where('sessions.id', idSession)
      .orderByRaw('lower("certification-candidates"."lastName"), lower("certification-candidates"."firstName")');

    if (!sessionCertificationCandidates.length) {
      throw new NotFoundError('La session n\'existe pas');
    }

    return new SessionForAttendanceSheet({
      ...sessionCertificationCandidates[0],
      certificationCandidates: sessionCertificationCandidates.map((sessionCertificationCandidate) => new CertificationCandidateForAttendanceSheet({
        ...sessionCertificationCandidate,
      })),
    });
  },
};
