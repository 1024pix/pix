const { CertifiedProfile } = require('../../../../lib/domain/read-models/CertifiedProfile');

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

module.exports = buildCertifiedProfile;
