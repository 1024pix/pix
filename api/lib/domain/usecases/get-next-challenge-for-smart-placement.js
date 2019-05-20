const { AssessmentEndedError } = require('../errors');
const smartRandom = require('../services/smart-random/smartRandom');

async function getNextChallengeForSmartPlacement({ assessment, answerRepository, challengeRepository, knowledgeElementRepository, targetProfileRepository }) {
  const [answers, [targetProfile, challenges], knowledgeElements] = await getSmartRandomInputValues({
    assessment,
    answerRepository,
    challengeRepository,
    knowledgeElementRepository,
    targetProfileRepository
  });
  const nextChallenge = smartRandom.getNextChallenge({ answers, challenges, targetSkills: targetProfile.skills, knowledgeElements });

  if (nextChallenge === null) {
    throw new AssessmentEndedError();
  }
  return nextChallenge;
}

function getSmartRandomInputValues({
  assessment,
  answerRepository,
  challengeRepository,
  knowledgeElementRepository,
  targetProfileRepository
}) {
  return Promise.all([
    answerRepository.findByAssessment(assessment.id),
    targetProfileRepository.get(assessment.campaignParticipation.getTargetProfileId())
      .then((targetProfile) => Promise.all([targetProfile, challengeRepository.findBySkills(targetProfile.skills)])),
    knowledgeElementRepository.findUniqByUserId({ userId: assessment.userId })]
  );
}

module.exports = getNextChallengeForSmartPlacement;
