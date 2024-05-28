import { knex } from '../../../../db/knex-database-connection.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../src/certification/shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationVersion } from '../../../../src/certification/shared/domain/models/CertificationVersion.js';
import { CertificationCandidateForSupervising } from '../../../../src/certification/supervision/domain/models/CertificationCandidateForSupervising.js';
import { CertificationCandidateForSupervisingV3 } from '../../../../src/certification/supervision/domain/models/CertificationCandidateForSupervisingV3.js';
import { NotFoundError } from '../../../domain/errors.js';
import { ComplementaryCertificationForSupervising } from '../../../domain/models/ComplementaryCertificationForSupervising.js';
import { SessionForSupervising } from '../../../domain/read-models/SessionForSupervising.js';

const get = async function (idSession) {
  const results = await knex
    .with('ongoing-live-alerts', (queryBuilder) => {
      queryBuilder
        .select('*')
        .from('certification-challenge-live-alerts')
        .where({ status: CertificationChallengeLiveAlertStatus.ONGOING });
    })
    .select({
      id: 'sessions.id',
      date: 'sessions.date',
      time: 'sessions.time',
      room: 'sessions.room',
      examiner: 'sessions.examiner',
      accessCode: 'sessions.accessCode',
      address: 'sessions.address',
      version: 'sessions.version',
      certificationCandidates: knex.raw(`
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
          'liveAlert', json_build_object(
            'status', "ongoing-live-alerts".status,
            'hasImage',"ongoing-live-alerts"."hasImage",
            'hasAttachment', "ongoing-live-alerts"."hasAttachment",
            'hasEmbed', "ongoing-live-alerts"."hasEmbed",
            'isFocus', "ongoing-live-alerts"."isFocus"
          ),
          'complementaryCertification', json_build_object(
            'key', "complementary-certifications"."key",
            'label', "complementary-certifications"."label",
            'certificationExtraTime', "complementary-certifications"."certificationExtraTime"
          )
        ) order by "ongoing-live-alerts".status, lower("certification-candidates"."lastName"), lower("certification-candidates"."firstName"))
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
    .leftJoin('ongoing-live-alerts', 'ongoing-live-alerts.assessmentId', 'assessments.id')
    .groupBy('sessions.id')
    .where({ 'sessions.id': idSession })
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
  return new CertificationCandidateForSupervising({
    ...candidateDto,
    enrolledComplementaryCertification: _toDomainComplementaryCertification(candidateDto.complementaryCertification),
  });
}

function _buildCertificationCandidateForSupervisingV3(candidateDto) {
  return new CertificationCandidateForSupervisingV3({
    ...candidateDto,
    enrolledComplementaryCertification: _toDomainComplementaryCertification(candidateDto.complementaryCertification),
  });
}

function _toDomain(results) {
  const certificationCandidates = results.certificationCandidates
    .filter((candidate) => candidate?.id !== null)
    .map((candidate) =>
      CertificationVersion.isV3(results.version)
        ? _buildCertificationCandidateForSupervisingV3(candidate)
        : _buildCertificationCandidateForSupervising(candidate),
    );

  return new SessionForSupervising({
    ...results,
    certificationCandidates,
  });
}
