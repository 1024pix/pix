import _ from 'lodash';
import { knex } from '../../../../../db/knex-database-connection.js';
import {
  CertificationChallengeLiveAlert,
  CertificationChallengeLiveAlertStatus,
} from '../../domain/models/CertificationChallengeLiveAlert.js';

const save = async function ({ certificationChallengeLiveAlert }) {
  return knex('certification-challenge-live-alerts')
    .insert({ ..._toDTO(certificationChallengeLiveAlert), updatedAt: new Date() })
    .onConflict(['id'])
    .merge();
};

const getByAssessmentId = async (assessmentId) => {
  const certificationChallengeLiveAlertsDto = await knex('certification-challenge-live-alerts').where({
    assessmentId,
  });

  return certificationChallengeLiveAlertsDto.map(_toDomain);
};

const getLiveAlertValidatedChallengeIdsByAssessmentId = async (assessmentId) => {
  const liveAlertValidatedChallengeIds = await knex('certification-challenge-live-alerts').select('challengeId').where({
    assessmentId,
    status: CertificationChallengeLiveAlertStatus.VALIDATED,
  });

  return _.map(liveAlertValidatedChallengeIds, 'challengeId');
};

const getOngoingBySessionIdAndUserId = async ({ sessionId, userId }) => {
  const certificationChallengeLiveAlertDto = await knex('certification-courses')
    .leftJoin('assessments', 'certification-courses.id', 'assessments.certificationCourseId')
    .leftJoin(
      'certification-challenge-live-alerts',
      `certification-challenge-live-alerts.assessmentId`,
      'assessments.id',
    )
    .where({
      'certification-courses.userId': userId,
      'certification-courses.sessionId': sessionId,
      'certification-challenge-live-alerts.status': CertificationChallengeLiveAlertStatus.ONGOING,
    })
    .first();

  return _toDomain(certificationChallengeLiveAlertDto);
};

const getOngoingByChallengeIdAndAssessmentId = async ({ challengeId, assessmentId }) => {
  const certificationChallengeLiveAlertDto = await knex('certification-challenge-live-alerts')
    .where({
      'certification-challenge-live-alerts.challengeId': challengeId,
      'certification-challenge-live-alerts.assessmentId': assessmentId,
      'certification-challenge-live-alerts.status': CertificationChallengeLiveAlertStatus.ONGOING,
    })
    .first();

  return _toDomain(certificationChallengeLiveAlertDto);
};

const _toDomain = (certificationChallengeLiveAlertDto) => {
  if (!certificationChallengeLiveAlertDto) {
    return null;
  }
  return new CertificationChallengeLiveAlert(certificationChallengeLiveAlertDto);
};

const _toDTO = (certificationChallengeLiveAlertDto) => certificationChallengeLiveAlertDto;
export {
  save,
  getByAssessmentId,
  getOngoingBySessionIdAndUserId,
  getLiveAlertValidatedChallengeIdsByAssessmentId,
  getOngoingByChallengeIdAndAssessmentId,
};
