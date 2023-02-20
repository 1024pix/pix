import { AssessmentEndedError } from '../errors';
import smartRandom from '../services/algorithm-methods/smart-random';
import flash from '../services/algorithm-methods/flash';
import dataFetcher from '../services/algorithm-methods/data-fetcher';

export default async function getNextChallengeForCampaignAssessment({
  challengeRepository,
  answerRepository,
  flashAssessmentResultRepository,
  assessment,
  pickChallengeService,
  locale,
}) {
  let algoResult;

  if (assessment.isFlash()) {
    const inputValues = await dataFetcher.fetchForFlashCampaigns({
      assessmentId: assessment.id,
      answerRepository,
      challengeRepository,
      flashAssessmentResultRepository,
      locale,
    });
    algoResult = flash.getPossibleNextChallenges({ ...inputValues });

    if (algoResult.hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return assessment.chooseNextFlashChallenge(algoResult.possibleChallenges);
  } else {
    const inputValues = await dataFetcher.fetchForCampaigns(...arguments);
    algoResult = smartRandom.getPossibleSkillsForNextChallenge({ ...inputValues, locale });

    if (algoResult.hasAssessmentEnded) {
      throw new AssessmentEndedError();
    }

    return pickChallengeService.pickChallenge({
      skills: algoResult.possibleSkillsForNextChallenge,
      randomSeed: assessment.id,
      locale,
    });
  }
}
