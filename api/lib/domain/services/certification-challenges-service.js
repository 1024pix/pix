const _ = require('lodash');
const CertificationChallenge = require('../models/CertificationChallenge');
const {
  MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION,
} = require('../constants');

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
    const alreadyAnsweredChallengeIds = await answerRepository.findChallengeIdsFromAnswerIds(answerIds);

    const allFrFrOperativeChallenges = await challengeRepository.findFrenchFranceOperative();

    const certifiableUserCompetencesWithOrderedSkills =
      UserCompetence.orderSkillsOfCompetenceByDifficulty(placementProfile.userCompetences)
        .filter((uc) => uc.isCertifiable());

    let certificationChallenges = [];
    for (const userCompetence of certifiableUserCompetencesWithOrderedSkills) {
      const certificationChallengesForCompetence = [];
      for (const skill of userCompetence.skills) {
        if (certificationChallengesForCompetence.length >= MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION) break;
        const alreadySelectedChallengeIds = [
          ..._.map(certificationChallenges, 'challengeId'),
          ..._.map(certificationChallengesForCompetence, 'challengeId'),
        ];
        const certificationChallenge = pickCertificationChallengeForSkill(skill, userCompetence.id, allFrFrOperativeChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds);
        if (certificationChallenge) certificationChallengesForCompetence.push(certificationChallenge);
      }
      certificationChallenges = [...certificationChallenges, ...certificationChallengesForCompetence];
    }

    return certificationChallenges;
  },
};

function pickCertificationChallengeForSkill(skill, competenceId, allChallenges, alreadyAnsweredChallengeIds, alreadySelectedChallengeIds) {
  const challengesToValidateCurrentSkill = Challenge.findBySkill({ challenges: allChallenges, skill });
  const unansweredChallenges = _.filter(challengesToValidateCurrentSkill, (challenge) => !alreadyAnsweredChallengeIds.includes(challenge.id));

  const challengesPoolToPickChallengeFrom = _.isEmpty(unansweredChallenges) ? challengesToValidateCurrentSkill : unansweredChallenges;
  if (_.isEmpty(challengesPoolToPickChallengeFrom)) {
    return;
  }
  const challenge = _.sample(challengesPoolToPickChallengeFrom);

  if (alreadySelectedChallengeIds.includes(challenge.id)) return;

  return new CertificationChallenge({
    challengeId: challenge.id,
    competenceId,
    associatedSkillName: skill.name,
    associatedSkillId: skill.id,
  });
}
