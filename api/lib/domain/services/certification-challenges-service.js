const _ = require('lodash');
const CertificationChallenge = require('../models/CertificationChallenge');

module.exports = {

  generateCertificationChallenges(userCompetences, certificationCourseId) {
    const challenges = _.flatMap(userCompetences, (userCompetence) => {
      return userCompetence.challenges;
    });
    const certificationChallenges = _.map(challenges, (challenge) => {
      return new CertificationChallenge({
        challengeId: challenge.id,
        competenceId: challenge.competenceId,
        associatedSkillName: challenge.testedSkill.name,
        associatedSkillId: challenge.testedSkill.id,
        courseId: certificationCourseId,
      });
    });
    return certificationChallenges;
  }
};
