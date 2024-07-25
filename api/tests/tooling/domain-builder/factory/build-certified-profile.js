import { CertifiedProfile } from '../../../../src/shared/domain/read-models/CertifiedProfile.js';

const buildCertifiedProfile = function buildCertifiedProfile({
  id = 123,
  userId = 456,
  certifiedSkills = [],
  certifiedTubes = [],
  certifiedCompetences = [],
  certifiedAreas = [],
} = {}) {
  return new CertifiedProfile({
    id,
    userId,
    certifiedSkills,
    certifiedTubes,
    certifiedCompetences,
    certifiedAreas,
  });
};

export { buildCertifiedProfile };
