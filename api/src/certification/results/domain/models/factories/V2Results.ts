import { Frameworks, isEduFramework } from '../../../../shared/domain/models/Frameworks.js';
import type { V2Results } from '../NewCertificationResult.schema.ts';
import type { FullCertificationData } from './CertificationResultSourceData.ts';

export function buildV2Results({
  certificationItem,
  cleaItem,
  pixPlusV2VoletPixItem,
  pixPlusV2VoletExterneItem,
}: FullCertificationData): V2Results | null {
  const { framework, pixScore, competenceMarks } = certificationItem;

  if (framework === Frameworks.CLEA) {
    if (!cleaItem) return null;
    return {
      pixScore,
      competenceMarks,
      hasAcquiredClea: cleaItem.hasAcquiredClea,
      cleaBadgeId: cleaItem.cleaBadgeId,
    };
  }
  if (framework === Frameworks.PRO_SANTE || framework === Frameworks.DROIT) {
    if (!pixPlusV2VoletPixItem) return null;
    return {
      pixScore,
      competenceMarks,
      v2VoletPixAcquired: pixPlusV2VoletPixItem.v2VoletPixAcquired,
      v2VoletPixBadgeId: pixPlusV2VoletPixItem.v2VoletPixBadgeId,
    };
  }
  if (isEduFramework(framework)) {
    if (!pixPlusV2VoletPixItem) return null;
    return {
      pixScore,
      competenceMarks,
      v2VoletPixAcquired: pixPlusV2VoletPixItem.v2VoletPixAcquired,
      v2VoletPixBadgeId: pixPlusV2VoletPixItem.v2VoletPixBadgeId,
      v2VoletExterneBadgeId: pixPlusV2VoletExterneItem?.v2VoletExterneBadgeId ?? null,
      v2VoletExterneAcquired: pixPlusV2VoletExterneItem?.v2VoletExterneAcquired ?? null,
    };
  }
  return {
    pixScore,
    competenceMarks,
  };
}
