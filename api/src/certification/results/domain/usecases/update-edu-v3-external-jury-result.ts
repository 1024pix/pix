import type { UUID } from 'node:crypto';

import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { isEduFramework } from '../../../shared/domain/models/Frameworks.js';
import { CERTIFICATION_RESULT_STATUSES } from '../constants.ts';
import type { CertificationResult } from '../models/NewCertificationResult.ts';

type NewCertificationResultRepository = {
  getByCertificationCourseId: (certificationCourseId: number) => Promise<CertificationResult | null>;
  updateEduV3ExternalJuryResult: (params: {
    certificationResultId: UUID;
    newExternalJuryResult: string | null;
  }) => Promise<void>;
};

export async function updateEduV3ExternalJuryResult({
  certificationCourseId,
  v3EduExternalJuryResult,
  newCertificationResultRepository,
}: {
  certificationCourseId: number;
  v3EduExternalJuryResult: string | null;
  newCertificationResultRepository: NewCertificationResultRepository;
}): Promise<void> {
  const writeNewCertificationResults = (await featureToggles.get('writeNewCertificationResults')) as boolean;
  if (!writeNewCertificationResults) return;

  const certificationResult = await newCertificationResultRepository.getByCertificationCourseId(certificationCourseId);
  if (!certificationResult) return;

  if (
    !isEduFramework(certificationResult.framework) ||
    certificationResult.algorithmEngineVersion !== AlgorithmEngineVersion.V3
  ) {
    return logger.error(`Certification-course ${certificationCourseId} is not a V3 Edu certification`);
  }

  if (certificationResult.status !== CERTIFICATION_RESULT_STATUSES.VALIDATED) {
    return logger.error(
      `Certification-course ${certificationCourseId}: can't update external jury result when certification is not validated`,
    );
  }

  await newCertificationResultRepository.updateEduV3ExternalJuryResult({
    certificationResultId: certificationResult.id,
    newExternalJuryResult: v3EduExternalJuryResult,
  });
}
