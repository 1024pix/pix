import { CertificationAssessmentHistory } from '../../../../../../src/certification/scoring/domain/models/CertificationAssessmentHistory.js';

export const buildCertificationAssessmentHistory = ({ capacityHistory }) => {
  return new CertificationAssessmentHistory({
    capacityHistory,
  });
};
