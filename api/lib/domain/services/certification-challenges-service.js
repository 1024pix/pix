const _ = require('lodash');
const CertificationChallenge = require('../models/CertificationChallenge');

module.exports = {

  generateCertificationChallenges(challenges) {
    const certificationChallenges = _.map(challenges, (challenge) => {
      return new CertificationChallenge({
        challengeId: challenge.id,
        competenceId: challenge.competenceId,
        associatedSkillName: challenge.testedSkill.name,
        associatedSkillId: challenge.testedSkill.id
      });
    });
    return certificationChallenges;
  }
};
