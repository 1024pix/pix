import dayjs from 'dayjs';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { NotFoundError } from '../../../../shared/domain/errors.js';
import { CertificationChallengeLiveAlertStatus } from '../../../shared/domain/models/CertificationChallengeLiveAlert.js';
import { CertificationCompanionLiveAlertStatus } from '../../../shared/domain/models/CertificationCompanionLiveAlert.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import { CandidateForSupervising, SessionForSupervising } from '../../domain/read-models/SessionForSupervising.js';

export async function get({ id, dependencies = { certificationBadgesService } }) {
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
          'authorizedToStartAt', "certification-candidates"."authorizedToStartAt",
          'assessmentStatus', "assessments"."state",
          'startDateTime', "certification-courses"."createdAt",
          'assessmentDuration', "certification_versions"."assessmentDuration",
          'subscription', "certification-candidates"."subscription",
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
          )
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
  return _toDomain(results, dependencies.certificationBadgesService);
}

async function _toDomain(results, certificationBadgesService) {
  const candidateRows = results.certificationCandidates?.filter((candidate) => candidate?.id !== null) ?? [];
  const candidates = [];
  for (const candidateRow of candidateRows) {
    let isStillEligibleToDoubleCertification = false;
    if (candidateRow.subscription === Frameworks.CLEA) {
      const stillValidBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId: candidateRow.userId,
      });
      isStillEligibleToDoubleCertification = stillValidBadgeAcquisitions.some(
        (stillValidBadgeAcquisition) => stillValidBadgeAcquisition.complementaryCertificationKey === Frameworks.CLEA,
      );
    }

    const candidate = new CandidateForSupervising({
      id: candidateRow.id,
      userId: candidateRow.userId,
      firstName: candidateRow.firstName,
      lastName: candidateRow.lastName,
      birthdate: candidateRow.birthdate,
      extraTimePercentage:
        candidateRow.extraTimePercentage != null
          ? parseFloat(candidateRow.extraTimePercentage)
          : candidateRow.extraTimePercentage,
      authorizedToStartAt: candidateRow.authorizedToStartAt ? new Date(candidateRow.authorizedToStartAt) : null,
      assessmentStatus: candidateRow.assessmentStatus,
      startDateTime: candidateRow.startDateTime ? new Date(candidateRow.startDateTime) : null,
      theoricalEndDateTime: computeTheoricalEndDateTime(candidateRow.startDateTime, candidateRow.assessmentDuration),
      subscription: candidateRow.subscription,
      isStillEligibleToDoubleCertification,
      challengeLiveAlert: candidateRow.challengeLiveAlert?.status ? candidateRow.challengeLiveAlert : null,
      companionLiveAlert: candidateRow.companionLiveAlert?.status ? candidateRow.companionLiveAlert : null,
    });
    candidates.push(candidate);
  }

  return new SessionForSupervising({
    ...results,
    candidates,
  });
}

function computeTheoricalEndDateTime(startDateTime, assessmentDuration) {
  const start = dayjs(startDateTime || null);
  if (!start.isValid()) {
    return null;
  }

  return start.add(assessmentDuration, 'minute').toDate();
}
