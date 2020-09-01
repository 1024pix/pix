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

    const alreadyAnsweredChallengeIds = (await answerRepository.findChallengeIdsFromAnswerIds(answerIds))
      .map((id) => { return { id }; });

    const allFrFrOperativeChallenges = await challengeRepository.findFrenchFranceOperative();
    const userCompetences = UserCompetence.orderSkillsOfCompetenceByDifficulty(placementProfile.userCompetences);
    let certificationChallengesByCompetence = {};

    userCompetences.forEach((userCompetence) => {
      if (!userCompetence.isCertifiable()) {
        return;
      }
      userCompetence.skills.forEach((skill) => {
        if (!_hasCompetenceEnoughCertificationChallenges(userCompetence.id, certificationChallengesByCompetence)) {
          const challengesToValidateCurrentSkill = Challenge.findBySkill({ challenges: allFrFrOperativeChallenges, skill });
          const challengesLeftToAnswer = _.differenceBy(challengesToValidateCurrentSkill, alreadyAnsweredChallengeIds, 'id');

          const challengesPoolToPickChallengeFrom = (_.isEmpty(challengesLeftToAnswer)) ? challengesToValidateCurrentSkill : challengesLeftToAnswer;
          if (_.isEmpty(challengesPoolToPickChallengeFrom)) {
            return;
          }
          const challenge = _.sample(challengesPoolToPickChallengeFrom);
          const certificationChallenge = new CertificationChallenge({
            challengeId: challenge.id,
            competenceId: userCompetence.id,
            associatedSkillName: skill.name,
            associatedSkillId: skill.id,
          });
          certificationChallengesByCompetence = _addUniqueCertificationChallengeForCompetence(certificationChallengesByCompetence, certificationChallenge);
        }
      });
    });

    return _.flatten(Object.values(certificationChallengesByCompetence));
  },
};

function _hasCompetenceEnoughCertificationChallenges(competenceId, certificationChallengesByCompetence) {
  const certificationChallengesForGivenCompetence = certificationChallengesByCompetence[competenceId] || [];
  return certificationChallengesForGivenCompetence.length >= MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION;
}

function _addUniqueCertificationChallengeForCompetence(certificationChallengesByCompetence, certificationChallenge) {
  const mutatedCertificationChallengesByCompetence = _.cloneDeep(certificationChallengesByCompetence);
  const certificationChallengesForGivenCompetence = mutatedCertificationChallengesByCompetence[certificationChallenge.competenceId] || [];
  if (!_.some(certificationChallengesForGivenCompetence, { challengeId: certificationChallenge.challengeId })) {
    certificationChallengesForGivenCompetence.push(certificationChallenge);
  }
  mutatedCertificationChallengesByCompetence[certificationChallenge.competenceId] = certificationChallengesForGivenCompetence;
  return mutatedCertificationChallengesByCompetence;
}
