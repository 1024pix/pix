import { Frameworks } from '../../../../../../src/certification/configuration/domain/models/Frameworks.js';
import {
  CERTIFICATE_STATUSES,
  CERTIFICATE_TYPES,
  CertificateSummary,
  EXTRA_CERTIFICATE_STATUSES,
} from '../../../../../../src/certification/results/domain/models/CertificateSummary.js';
import { buildJuryComment } from '../shared/build-jury-comment.js';

export function buildCertificateSummary({
  id = 1,
  verificationCode = 'verificationCode',
  certificationStartedAt = new Date('2023-10-05'),
  certificationFramework = Frameworks.CORE,
  certificationCenterName = 'certificateCenterName',
  pixScore = 2,
  juryComment = buildJuryComment(),
  status = CERTIFICATE_STATUSES.VALIDATED,
  extraCertificationStatus = EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
  certificateType = CERTIFICATE_TYPES.CERTIFICATE,
  reachedMeshIndex = 0,
} = {}) {
  return new CertificateSummary({
    id,
    verificationCode,
    certificationStartedAt,
    certificationFramework,
    certificationCenterName,
    pixScore,
    juryComment,
    status,
    extraCertificationStatus,
    certificateType,
    reachedMeshIndex,
  });
}
