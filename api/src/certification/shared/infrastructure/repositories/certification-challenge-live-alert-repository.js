import _ from 'lodash';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import {
  CertificationChallengeLiveAlert,
  CertificationChallengeLiveAlertStatus,
} from '../../domain/models/CertificationChallengeLiveAlert.js';

const save = async function ({ certificationChallengeLiveAlert }) {
  const knexConn = DomainTransaction.getConnection();
  return knexConn('certification-challenge-live-alerts')
    .insert({ ..._toDTO(certificationChallengeLiveAlert), updatedAt: new Date() })
    .onConflict(['id'])
    .merge();
};

const getByAssessmentId = async ({ assessmentId }) => {
  const knexConn = DomainTransaction.getConnection();
  const certificationChallengeLiveAlertsDto = await knexConn('certification-challenge-live-alerts').where({
    assessmentId,
  });

  return certificationChallengeLiveAlertsDto.map(_toDomain);
};

/**
 * @param {object} params
 * @param {number} params.assessmentId
 * @returns {Array<string>} array of challengeId with validated live alert raised for that assessment
 */
const getLiveAlertValidatedChallengeIdsByAssessmentId = async ({ assessmentId }) => {
  const knexConn = DomainTransaction.getConnection();
  const liveAlertValidatedChallengeIds = await knexConn('certification-challenge-live-alerts')
    .select('challengeId')
    .where({
      assessmentId,
      status: CertificationChallengeLiveAlertStatus.VALIDATED,
    });

  return _.map(liveAlertValidatedChallengeIds, 'challengeId');
};

const getOngoingBySessionIdAndUserId = async ({ sessionId, userId }) => {
  const knexConn = DomainTransaction.getConnection();
  const certificationChallengeLiveAlertDto = await knexConn('certification-courses')
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
  const knexConn = DomainTransaction.getConnection();
  const certificationChallengeLiveAlertDto = await knexConn('certification-challenge-live-alerts')
    .where({
      'certification-challenge-live-alerts.challengeId': challengeId,
      'certification-challenge-live-alerts.assessmentId': assessmentId,
      'certification-challenge-live-alerts.status': CertificationChallengeLiveAlertStatus.ONGOING,
    })
    .first();

  return _toDomain(certificationChallengeLiveAlertDto);
};

const getOngoingOrValidatedByChallengeIdAndAssessmentId = async ({ challengeId, assessmentId }) => {
  const knexConn = DomainTransaction.getConnection();
  const certificationChallengeLiveAlertDto = await knexConn('certification-challenge-live-alerts')
    .where({
      'certification-challenge-live-alerts.challengeId': challengeId,
      'certification-challenge-live-alerts.assessmentId': assessmentId,
      'certification-challenge-live-alerts.status': CertificationChallengeLiveAlertStatus.ONGOING,
    })
    .orWhere({
      'certification-challenge-live-alerts.challengeId': challengeId,
      'certification-challenge-live-alerts.assessmentId': assessmentId,
      'certification-challenge-live-alerts.status': CertificationChallengeLiveAlertStatus.VALIDATED,
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
  getByAssessmentId,
  getLiveAlertValidatedChallengeIdsByAssessmentId,
  getOngoingByChallengeIdAndAssessmentId,
  getOngoingBySessionIdAndUserId,
  getOngoingOrValidatedByChallengeIdAndAssessmentId,
  save,
};
