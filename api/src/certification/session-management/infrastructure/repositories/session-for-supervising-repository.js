import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationChallengeLiveAlertStatus } from '../../../shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../shared/domain/models/CertificationCompanionLiveAlert.js';
import { CertificationCandidateForSupervising } from '../../domain/models/CertificationCandidateForSupervising.js';
import { SessionForSupervising } from '../../domain/read-models/SessionForSupervising.js';

const get = async function ({ id }) {
  const knexConn = DomainTransaction.getConnection();
  const results = await knexConn
    .select({
      id: 'sessions.id',
      date: 'sessions.date',
      time: 'sessions.time',
      room: 'sessions.room',
      examiner: 'sessions.examiner',
      accessCode: 'sessions.accessCode',
      address: 'sessions.address',
      certificationCandidates: knexConn
        .select(
          knexConn.raw(`
        json_agg(json_build_object(
          'userId', "certification-candidates"."userId",
          'firstName', "certification-candidates"."firstName",
          'lastName', "certification-candidates"."lastName",
          'birthdate', "certification-candidates"."birthdate",
          'id', "certification-candidates"."id",
          'extraTimePercentage', "certification-candidates"."extraTimePercentage",
          'authorizedToStart', "certification-candidates"."authorizedToStart",
          'assessmentStatus', "assessments"."state",
          'startDateTime', "certification-courses"."createdAt",
          'assessmentDuration', "certification_versions"."assessmentDuration",
          'challengeLiveAlert', json_build_object(
            'type', 'challenge',
            'status', "certification-challenge-live-alerts".status,
            'hasImage',"certification-challenge-live-alerts"."hasImage",
            'hasAttachment', "certification-challenge-live-alerts"."hasAttachment",
            'hasEmbed', "certification-challenge-live-alerts"."hasEmbed",
            'isFocus', "certification-challenge-live-alerts"."isFocus"
          ),
          'companionLiveAlert', json_build_object(
            'type', 'companion',
            'status', "certification-companion-live-alerts".status
          ),
          'subscription', "certification-candidates"."subscription"
        ) order by "certification-companion-live-alerts".status, "certification-challenge-live-alerts".status, lower("certification-candidates"."lastName"), lower("certification-candidates"."firstName"))
    `),
        )
        .from('certification-candidates')
        .leftJoin('certification-courses', 'certification-courses.candidateId', 'certification-candidates.id')
        .leftJoin('certification_versions', 'certification_versions.id', 'certification-courses.versionId')
        .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
        .leftJoin('certification-challenge-live-alerts', function () {
          this.on('certification-challenge-live-alerts.assessmentId', '=', 'assessments.id').andOnVal(
            'certification-challenge-live-alerts.status',
            '=',
            CertificationChallengeLiveAlertStatus.ONGOING,
          );
        })
        .leftJoin('certification-companion-live-alerts', function () {
          this.on('certification-companion-live-alerts.assessmentId', '=', 'assessments.id').andOnVal(
            'certification-companion-live-alerts.status',
            '=',
            CertificationCompanionLiveAlertStatus.ONGOING,
          );
        })
        .whereRaw('"certification-candidates"."sessionId" = sessions.id'),
    })
    .from('sessions')
    .where({ 'sessions.id': id })
    .first();
  if (!results) {
    throw new NotFoundError("La session n'existe pas");
  }
  return _toDomain(results);
};

export { get };

function _toDomain(results) {
  const certificationCandidates =
    results.certificationCandidates
      ?.filter((candidate) => candidate?.id !== null)
      ?.map((candidate) => new CertificationCandidateForSupervising(candidate)) ?? [];

  return new SessionForSupervising({
    ...results,
    certificationCandidates,
  });
}
