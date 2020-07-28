const _ = require('lodash');
const CertificationChallenge = require('../models/CertificationChallenge');

const KnowledgeElement = require('../models/KnowledgeElement');
const UserCompetence = require('../models/UserCompetence');
const Challenge = require('../models/Challenge');
const challengeRepository = require('../../infrastructure/repositories/challenge-repository');
const answerRepository = require('../../infrastructure/repositories/answer-repository');
const knowledgeElementRepository = require('../../infrastructure/repositories/knowledge-element-repository');

module.exports = {

  async pickCertificationChallenges(placementProfile) {
    const knowledgeElementsByCompetence = await knowledgeElementRepository
      .findUniqByUserIdGroupedByCompetenceId({ userId: placementProfile.userId, limitDate: placementProfile.profileDate });

    const knowledgeElements = KnowledgeElement.findDirectlyValidatedFromGroups(knowledgeElementsByCompetence);
    const answerIds = _.map(knowledgeElements, 'answerId');

    const challengeIdsCorrectlyAnswered = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

    const allChallenges = await challengeRepository.findOperative();
    const challengesAlreadyAnswered = challengeIdsCorrectlyAnswered.map((challengeId) => Challenge.findById(allChallenges, challengeId));

    challengesAlreadyAnswered.forEach((challenge) => {
      if (!challenge) {
        return;
      }

      const userCompetence = _getUserCompetenceByChallengeCompetenceId(placementProfile.userCompetences, challenge);

      if (!userCompetence || !userCompetence.isCertifiable()) {
        return;
      }

      challenge.skills
        .filter((skill) => _skillHasAtLeastOneChallenge(skill, allChallenges))
        .forEach((publishedSkill) => userCompetence.addSkill(publishedSkill));
    });

    const userCompetences = UserCompetence.orderSkillsOfCompetenceByDifficulty(placementProfile.userCompetences);

    userCompetences.forEach((userCompetence) => {
      const testedSkills = [];
      userCompetence.skills.forEach((skill) => {
        if (!userCompetence.hasEnoughChallenges()) {
          const challengesToValidateCurrentSkill = Challenge.findBySkill({ challenges: allChallenges, skill });
          const challengesLeftToAnswer = _.difference(challengesToValidateCurrentSkill, challengesAlreadyAnswered);

          const challengesPoolToPickChallengeFrom = (_.isEmpty(challengesLeftToAnswer)) ? challengesToValidateCurrentSkill : challengesLeftToAnswer;
          const challenge = _.sample(challengesPoolToPickChallengeFrom);

          challenge.testedSkill = skill;
          testedSkills.push(skill);

          userCompetence.addChallenge(challenge);
        }
      });
      userCompetence.skills = testedSkills;
    });

    const challenges = _.flatMap(userCompetences, (userCompetence) => userCompetence.challenges);
    return _generateCertificationChallenges(challenges);
  },
};

function _generateCertificationChallenges(challenges) {
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

function _getUserCompetenceByChallengeCompetenceId(userCompetences, challenge) {
  return challenge ? userCompetences.find((userCompetence) => userCompetence.id === challenge.competenceId) : null;
}

function _skillHasAtLeastOneChallenge(skill, challenges) {
  const challengesBySkill = Challenge.findBySkill({ challenges, skill });
  return challengesBySkill.length > 0;
}
