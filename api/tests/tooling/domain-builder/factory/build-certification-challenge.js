const buildSkill = require('./build-skill');
const CertificationChallenge = require('../../../../lib/domain/models/CertificationChallenge');

module.exports = function buildCertificationChallenge({
  id = 123,
  challengeId = 'recCHAL',
  competenceId = 'recCOMP',
  courseId = 456,
  associatedSkillId = buildSkill().id,
  associatedSkillName = buildSkill().name,
} = {}) {

  return new CertificationChallenge({
    id,
    challengeId,
    competenceId,
    courseId,
    associatedSkillId,
    associatedSkillName,
  });
};
