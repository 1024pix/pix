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
      v2ComplementaryVoletPixAcquired: pixPlusV2VoletPixItem.v2ComplementaryVoletPixAcquired,
      v2ComplementaryVoletPixBadgeId: pixPlusV2VoletPixItem.v2ComplementaryVoletPixBadgeId,
    };
  }
  if (isEduFramework(framework)) {
    if (!pixPlusV2VoletPixItem) return null;
    return {
      pixScore,
      competenceMarks,
      v2ComplementaryVoletPixAcquired: pixPlusV2VoletPixItem.v2ComplementaryVoletPixAcquired,
      v2ComplementaryVoletPixBadgeId: pixPlusV2VoletPixItem.v2ComplementaryVoletPixBadgeId,
      v2EduVoletExterneBadgeId: pixPlusV2VoletExterneItem?.v2EduVoletExterneBadgeId ?? null,
      v2EduVoletExterneAcquired: pixPlusV2VoletExterneItem?.v2EduVoletExterneAcquired ?? null,
    };
  }
  return {
    pixScore,
    competenceMarks,
  };
}
