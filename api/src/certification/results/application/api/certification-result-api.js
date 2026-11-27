import { randomUUID } from 'node:crypto';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CertificationResultFactory } from '../../domain/models/factories/CertificationResultFactory.ts';
import { usecases } from '../../domain/usecases/index.js';
import * as certificationResultSourceDataRepository from '../../infrastructure/repositories/certification-result-source-data-repository.ts';
import * as newCertificationResultRepository from '../../infrastructure/repositories/new-certification-result-repository.js';

/**
 * @function
 * @name buildForSession
 * @param {object} params
 * @param {number} params.sessionId
 * @returns {Promise<void>}
 */
export async function buildForSession({
  sessionId,
  dependencies = {
    certificationResultSourceDataRepository,
    newCertificationResultRepository,
    uuidGenerator: randomUUID,
    featureToggles,
  },
}) {
  const writeNewCertificationResults = await dependencies.featureToggles.get('writeNewCertificationResults');
  if (!writeNewCertificationResults) {
    return;
  }
  const sourceData = await dependencies.certificationResultSourceDataRepository.findBySessionId(sessionId);
  const { certificationResults, userCertificationResults, errors } = CertificationResultFactory.buildAll(
    sourceData,
    dependencies.uuidGenerator,
  );
  if (Object.keys(errors).length > 0) {
    logger.error(`Errors encountered when generating certification results: ${JSON.stringify(errors)}`);
  }

  await DomainTransaction.execute(() => {
    return dependencies.newCertificationResultRepository.save({ certificationResults, userCertificationResults });
  });
}

/**
 * @function
 * @name updateEduV3ExternalJuryResult
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {string | null} params.v3EduExternalJuryResult
 * @returns {Promise<void>}
 */
export async function updateEduV3ExternalJuryResult({ certificationCourseId, v3EduExternalJuryResult }) {
  return usecases.updateEduV3ExternalJuryResult({ certificationCourseId, v3EduExternalJuryResult });
}

/**
 * @function
 * @name updateEduV2ExternalJuryResult
 * @param {object} params
 * @param {number} params.certificationCourseId
 * @param {number | null} params.v2EduVoletExterneBadgeId
 * @param {boolean | null} params.v2EduVoletExterneAcquired
 * @returns {Promise<void>}
 */
export async function updateEduV2ExternalJuryResult({
  certificationCourseId,
  v2EduVoletExterneBadgeId,
  v2EduVoletExterneAcquired,
}) {
  return usecases.updateEduV2ExternalJuryResult({
    certificationCourseId,
    v2EduVoletExterneBadgeId,
    v2EduVoletExterneAcquired,
  });
}
