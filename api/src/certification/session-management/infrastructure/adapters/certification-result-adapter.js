import * as certificationResultApi from '../../../results/application/api/certification-result-api.js';

/**
 * @param {object} params
 * @param {number} params.sessionId
 */
export async function buildCertificationResults({ sessionId, dependencies = { certificationResultApi } }) {
  await dependencies.certificationResultApi.buildForSession({ sessionId });
}
