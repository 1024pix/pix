import { CertificationAssessmentScoreV3 } from '../../../../lib/domain/models/CertificationAssessmentScoreV3.js';
import { status as CertificationStatus } from '../../../../src/shared/domain/models/AssessmentResult.js';

const buildCertificationAssessmentScoreV3 = function ({ nbPix = 100, status = CertificationStatus.VALIDATED } = {}) {
  return new CertificationAssessmentScoreV3({
    status,
    nbPix,
  });
};

export { buildCertificationAssessmentScoreV3 };
