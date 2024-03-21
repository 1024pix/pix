import { V3CertificationScoring } from '../../../../../../src/certification/scoring/domain/models/V3CertificationScoring.js';

export const buildV3CertificationScoring = ({
  competencesForScoring = [],
  certificationScoringConfiguration = [{ meshLevel: 0, bounds: { min: -8, max: 8 } }],
} = {}) => {
  return new V3CertificationScoring({
    competencesForScoring,
    certificationScoringConfiguration,
  });
};
