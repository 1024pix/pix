import { CertificationAssessmentScoreV3 } from '../../../../lib/domain/models/CertificationAssessmentScoreV3.js';

const buildCertificationAssessmentScoreV3 = function ({ nbPix = 100 } = {}) {
  return new CertificationAssessmentScoreV3({
    nbPix,
  });
};

export { buildCertificationAssessmentScoreV3 };
