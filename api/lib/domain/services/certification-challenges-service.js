const _ = require('lodash');
const CertificationChallenge = require('../models/CertificationChallenge');

module.exports = {

  generateCertificationChallenges(userCompetences, certificationCourseId) {
    return _.flatMap(userCompetences, (userCompetence) => {
      return _.map(userCompetence.challenges, (challenge) => {
        return new CertificationChallenge({
          challengeId: challenge.id,
          competenceId: challenge.competenceId,
          associatedSkillName: challenge.testedSkill.name,
          associatedSkillId: challenge.testedSkill.id,
          courseId: certificationCourseId,
        });
      });
    });
  }
};
