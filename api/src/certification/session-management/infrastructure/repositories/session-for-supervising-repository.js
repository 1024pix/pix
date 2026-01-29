import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationChallengeLiveAlertStatus } from '../../../shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../shared/domain/models/CertificationCompanionLiveAlert.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { CertificationCandidateForSupervising } from '../../domain/models/CertificationCandidateForSupervising.js';
import { ComplementaryCertificationForSupervising } from '../../domain/models/ComplementaryCertificationForSupervising.js';
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
      certificationCandidates: knexConn.raw(`
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
          'complementaryCertification', json_build_object(
            'key', "complementary-certifications"."key",
            'label', "complementary-certifications"."label",
            'certificationExtraTime', "complementary-certifications"."certificationExtraTime"
          )
        ) order by "certification-companion-live-alerts".status, "certification-challenge-live-alerts".status, lower("certification-candidates"."lastName"), lower("certification-candidates"."firstName"))
    `),
    })
    .from('sessions')
    .leftJoin('certification-candidates', 'certification-candidates.sessionId', 'sessions.id')
    .leftJoin('certification-courses', function () {
      this.on('certification-courses.sessionId', '=', 'sessions.id');
      this.on('certification-courses.userId', '=', 'certification-candidates.userId');
    })
    .leftJoin('assessments', 'assessments.certificationCourseId', 'certification-courses.id')
    .leftJoin('certification-subscriptions', (builder) =>
      builder
        .on('certification-candidates.id', '=', 'certification-subscriptions.certificationCandidateId')
        .onNotNull('certification-subscriptions.complementaryCertificationId'),
    )
    .leftJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'certification-subscriptions.complementaryCertificationId',
    )
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
    .groupBy('sessions.id')
    .where({ 'sessions.id': id })
    .first();
  if (!results) {
    throw new NotFoundError("La session n'existe pas");
  }
  return _toDomain(results);
};

export { get };

function _toDomainComplementaryCertification(complementaryCertification) {
  if (complementaryCertification?.key) {
    return new ComplementaryCertificationForSupervising(complementaryCertification);
  }
  return null;
}

function _buildCertificationCandidateForSupervising(candidateDto) {
  if (candidateDto.complementaryCertification?.key === ComplementaryCertificationKeys.CLEA) {
    return new CertificationCandidateForSupervising({
      ...candidateDto,
      enrolledDoubleCertification: _toDomainComplementaryCertification(candidateDto.complementaryCertification),
      enrolledComplementaryCertification: null,
    });
  }

  return new CertificationCandidateForSupervising({
    ...candidateDto,
    enrolledComplementaryCertification: _toDomainComplementaryCertification(candidateDto.complementaryCertification),
    enrolledDoubleCertification: null,
  });
}

function _toDomain(results) {
  const certificationCandidates = results.certificationCandidates
    .filter((candidate) => candidate?.id !== null)
    .map((candidate) => _buildCertificationCandidateForSupervising(candidate));

  return new SessionForSupervising({
    ...results,
    certificationCandidates,
  });
}
