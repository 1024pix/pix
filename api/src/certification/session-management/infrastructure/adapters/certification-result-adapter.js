import * as certificationResultApi from '../../../results/application/api/certification-result-api.js';

/**
 * @param {object} params
 * @param {number} params.sessionId
 */
export async function buildCertificationResults({ sessionId, dependencies = { certificationResultApi } }) {
  await dependencies.certificationResultApi.buildForSession({ sessionId });
}

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {string | null} params.eduV3ExternalJuryResult
 */
export async function updateEduV3ExternalJuryResult({
  certificationCourseId,
  eduV3ExternalJuryResult,
  dependencies = { certificationResultApi },
}) {
  await dependencies.certificationResultApi.updateEduV3ExternalJuryResult({
    certificationCourseId,
    v3EduExternalJuryResult: eduV3ExternalJuryResult,
  });
}

/**
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {number | null} params.v2EduVoletExterneBadgeId
 * @param {boolean | null} params.v2EduVoletExterneAcquired
 */
export async function updateEduV2ExternalJuryResult({
  certificationCourseId,
  v2EduVoletExterneBadgeId,
  v2EduVoletExterneAcquired,
  dependencies = { certificationResultApi },
}) {
  await dependencies.certificationResultApi.updateEduV2ExternalJuryResult({
    certificationCourseId,
    v2EduVoletExterneBadgeId,
    v2EduVoletExterneAcquired,
  });
}
