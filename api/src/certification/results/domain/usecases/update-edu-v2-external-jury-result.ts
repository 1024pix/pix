import type { UUID } from 'node:crypto';

import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { isEduFramework } from '../../../shared/domain/models/Frameworks.js';
import type { V2EduResults } from '../models/NewCertificationResult.schema.ts';
import type { CertificationResult } from '../models/NewCertificationResult.ts';

type NewCertificationResultRepository = {
  getByCertificationCourseId: (certificationCourseId: number) => Promise<CertificationResult | null>;
  updateEduV2ExternalJuryResult: (params: {
    certificationResultId: UUID;
    v2EduVoletExterneBadgeId: number | null;
    v2EduVoletExterneAcquired: boolean | null;
  }) => Promise<void>;
};

export async function updateEduV2ExternalJuryResult({
  certificationCourseId,
  v2EduVoletExterneBadgeId,
  v2EduVoletExterneAcquired,
  newCertificationResultRepository,
}: {
  certificationCourseId: number;
  v2EduVoletExterneBadgeId: number | null;
  v2EduVoletExterneAcquired: boolean | null;
  newCertificationResultRepository: NewCertificationResultRepository;
}): Promise<void> {
  const writeNewCertificationResults = (await featureToggles.get('writeNewCertificationResults')) as boolean;
  if (!writeNewCertificationResults) return;

  const certificationResult = await newCertificationResultRepository.getByCertificationCourseId(certificationCourseId);
  if (!certificationResult) return;

  if (
    !isEduFramework(certificationResult.framework) ||
    certificationResult.algorithmEngineVersion !== AlgorithmEngineVersion.V2
  ) {
    return logger.error(`Certification-course ${certificationCourseId} is not a V2 Edu certification`);
  }

  if (!(certificationResult.results as V2EduResults).v2ComplementaryVoletPixAcquired) {
    return logger.error(
      `Certification-course ${certificationCourseId}: can't update external jury result when Edu volet pix is not acquired`,
    );
  }

  await newCertificationResultRepository.updateEduV2ExternalJuryResult({
    certificationResultId: certificationResult.id,
    v2EduVoletExterneBadgeId,
    v2EduVoletExterneAcquired,
  });
}
