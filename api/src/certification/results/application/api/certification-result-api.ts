import { randomUUID, type UUID } from 'node:crypto';

import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { featureToggles } from '../../../../shared/infrastructure/feature-toggles/index.js';
import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CertificationResultFactory } from '../../domain/models/factories/CertificationResultFactory.ts';
import { usecases } from '../../domain/usecases/index.js';
import { updateEduV2ExternalJuryResult as uc } from '../../domain/usecases/update-edu-v2-external-jury-result.ts';
import * as certificationResultSourceDataRepository from '../../infrastructure/repositories/certification-result-source-data-repository.ts';
import * as newCertificationResultRepository from '../../infrastructure/repositories/new-certification-result-repository.ts';

type CertificationResultSourceDataRepository = typeof certificationResultSourceDataRepository;
type NewCertificationResultRepository = typeof newCertificationResultRepository;

export async function buildForSession({
  sessionId,
  dependencies = {
    certificationResultSourceDataRepository,
    newCertificationResultRepository,
    uuidGenerator: randomUUID,
    featureToggles,
  },
}: {
  sessionId: number;
  dependencies?: {
    certificationResultSourceDataRepository: Pick<CertificationResultSourceDataRepository, 'findBySessionId'>;
    newCertificationResultRepository: Pick<NewCertificationResultRepository, 'save'>;
    uuidGenerator: () => UUID;
    featureToggles: { get: (name: string) => Promise<boolean> };
  };
}): Promise<void> {
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

export async function deleteForSession({
  sessionId,
  dependencies = { newCertificationResultRepository },
}: {
  sessionId: number;
  dependencies?: {
    newCertificationResultRepository: Pick<NewCertificationResultRepository, 'deleteBySession'>;
  };
}): Promise<void> {
  await DomainTransaction.execute(() => {
    return dependencies.newCertificationResultRepository.deleteBySession(sessionId);
  });
}

export async function updateEduV3ExternalJuryResult({
  certificationCourseId,
  v3EduExternalJuryResult,
}: {
  certificationCourseId: number;
  v3EduExternalJuryResult: string | null;
}): Promise<void> {
  return usecases.updateEduV3ExternalJuryResult({ certificationCourseId, v3EduExternalJuryResult }); // probleme ici
}

export async function updateEduV2ExternalJuryResult({
  certificationCourseId,
  v2EduVoletExterneBadgeId,
  v2EduVoletExterneAcquired,
  dependencies = { newCertificationResultRepository },
}: {
  certificationCourseId: number;
  v2EduVoletExterneBadgeId: number | null;
  v2EduVoletExterneAcquired: boolean | null;
  dependencies?: {
    newCertificationResultRepository: NewCertificationResultRepository;
  };
}): Promise<void> {
  // ICI IMPORT EN DIRECT DU USECASE AVEC INJECTION A LA MANO
  return uc({
    certificationCourseId,
    v2EduVoletExterneBadgeId,
    v2EduVoletExterneAcquired,
    newCertificationResultRepository: dependencies.newCertificationResultRepository,
  });
}

// CONTREPROPOSITION il faudrait sortir lui de ce fichier mais bon
export async function detachOrganizationLearners({
  organizationLearnerIds,
  dependencies = { newCertificationResultRepository },
}: {
  organizationLearnerIds: number[];
  dependencies?: {
    newCertificationResultRepository: Pick<NewCertificationResultRepository, 'detachOrganizationLearners'>;
  };
}): Promise<void> {
  await dependencies.newCertificationResultRepository.detachOrganizationLearners(organizationLearnerIds);
}
