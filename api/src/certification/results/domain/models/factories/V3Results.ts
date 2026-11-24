import { Frameworks, isEduFramework } from '../../../../shared/domain/models/Frameworks.js';
import type { V3Results } from '../NewCertificationResult.schema.ts';
import type { FullCertificationData } from './CertificationResultSourceData.ts';

export function buildV3Results({ certificationItem, cleaItem }: FullCertificationData): V3Results | null {
  const { framework, maxReachableLevel, reachedMeshIndex, pixScore, competenceMarks, v3EduExternalJuryResult } =
    certificationItem;

  if (framework === Frameworks.CORE) {
    return {
      maxReachableLevel,
      reachedMeshIndex,
      pixScore,
      competenceMarks,
    };
  }
  if (isEduFramework(framework)) {
    return {
      maxReachableLevel,
      reachedMeshIndex,
      v3EduExternalJuryResult,
    };
  }
  if (framework === Frameworks.CLEA) {
    if (!cleaItem) return null;
    return {
      maxReachableLevel,
      reachedMeshIndex,
      pixScore,
      competenceMarks,
      hasAcquiredClea: cleaItem.hasAcquiredClea,
      cleaBadgeId: cleaItem.cleaBadgeId,
    };
  }
  return {
    maxReachableLevel,
    reachedMeshIndex,
  };
}
