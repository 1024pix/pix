const { CertifiedSkill } = require('../../../../lib/domain/read-models/CertifiedProfile');

const buildCertifiedSkill = function buildCertifiedSkill({
  id = 'someSkillId',
  name = 'someName',
  hasBeenAskedInCertif = false,
  tubeId = 'someTubeId',
  difficulty = 1,
} = {}) {
  return new CertifiedSkill({
    id,
    name,
    hasBeenAskedInCertif,
    tubeId,
    difficulty,
  });
};

module.exports = buildCertifiedSkill;
