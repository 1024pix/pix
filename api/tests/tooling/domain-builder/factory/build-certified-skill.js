const { CertifiedSkill } = require('../../../../lib/domain/read-models/CertifiedProfile');

const buildCertifiedSkill = function buildCertifiedSkill({
  id = 'someSkillId',
  name = 'someName',
  hasBeenAskedInCertif = false,
  tubeId = 'someTubeId',
} = {}) {
  return new CertifiedSkill({
    id,
    name,
    hasBeenAskedInCertif,
    tubeId,
  });
};

module.exports = buildCertifiedSkill;
