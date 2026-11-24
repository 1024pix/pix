import type { V1Results } from '../NewCertificationResult.schema.ts';
import type { FullCertificationData } from './CertificationResultSourceData.ts';

export function buildV1Results({ certificationItem }: FullCertificationData): V1Results {
  return {
    pixScore: certificationItem.pixScore,
    competenceMarks: certificationItem.competenceMarks,
  };
}
