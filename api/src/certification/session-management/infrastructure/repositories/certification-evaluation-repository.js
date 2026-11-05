/**
 * @typedef {import('../../../../shared/domain/events/deprecated/CertificationCancelled.js').CertificationCancelled} CertificationCancelled
 * @typedef {import('../../../../shared/domain/events/deprecated/CertificationUncancelled.js').CertificationUncancelled} CertificationUncancelled
 * @typedef {import('../../../evaluation/application/api/certification-evaluation-api.js').CertificationEvaluationApi} CertificationEvaluationApi
 */
import * as certificationEvaluationApi from '../../../evaluation/application/api/certification-evaluation-api.js';

/**
 * @param {object} params
 * @param {CertificationJuryDone|CertificationCourseRejected|CertificationCourseUnrejected|CertificationCancelled|CertificationRescored|CertificationUncancelled} params.event
 * @param {CertificationEvaluationApi} params.dependencies.certificationEvaluationApi
 * @returns {Promise<void>}
 */
export async function rescoreV3Certification({ event, dependencies = { certificationEvaluationApi } }) {
  return dependencies.certificationEvaluationApi.rescoreV3Certification({
    event,
  });
}

/**
 * @param {object} params
 * @param {ChallengeNeutralized|ChallengeDeneutralized|CertificationJuryDone|CertificationCourseRejected|CertificationCourseUnrejected|CertificationCancelled|CertificationRescored|CertificationUncancelled} params.event
 * @param {CertificationEvaluationApi} params.dependencies.certificationEvaluationApi
 * @returns {Promise<void>}
 */
export async function rescoreV2Certification({ event, dependencies = { certificationEvaluationApi } }) {
  return dependencies.certificationEvaluationApi.rescoreV2Certification({
    event,
  });
}
