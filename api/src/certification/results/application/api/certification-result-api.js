import { randomUUID } from 'node:crypto';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import * as certificationResultBuilderRepository from '../../infrastructure/repositories/certification-result-builder-repository.js';
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
    certificationResultBuilderRepository,
    newCertificationResultRepository,
    uuidGenerator: randomUUID,
    featureToggles,
  },
}) {
  const useNewCertificationResults = await dependencies.featureToggles.get('useNewCertificationResults');
  if (!useNewCertificationResults) {
    return;
  }
  const certificationResultBuilder =
    await dependencies.certificationResultBuilderRepository.findBuilderForCertificationsInSession(sessionId);
  const { certificationResults, userCertificationResults, errors } = certificationResultBuilder.build(
    dependencies.uuidGenerator,
  );
  if (Object.keys(errors).length > 0) {
    logger.error(`Errors encountered when generating certification results: ${JSON.stringify(errors)}`);
  }

  await DomainTransaction.execute(() => {
    return dependencies.newCertificationResultRepository.save({ certificationResults, userCertificationResults });
  });
}
