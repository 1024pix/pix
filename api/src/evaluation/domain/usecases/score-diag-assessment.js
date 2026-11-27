import { FlashAssessmentAlgorithm } from '../../../certification/evaluation/domain/models/FlashAssessmentAlgorithm.js';
import { ScoringV3Algorithm } from '../../../certification/evaluation/domain/models/ScoringV3Algorithm.js';

export async function scoreDiagAssessment({
  assessmentId,
  locale,
  flashAlgorithmService,
  assessmentRepository,
  versionRepository,
  calibratedChallengeRepository,
  scoringConfigurationRepository,
}) {
  const assessment = await assessmentRepository.get(assessmentId);
  const version = await versionRepository.getByCampaignId(assessment.campaign.id);
  const v3CertificationScoring = await scoringConfigurationRepository.getLatestByVersion({
    version,
  });
  const algorithm = new FlashAssessmentAlgorithm({
    flashAlgorithmImplementation: flashAlgorithmService,
    configuration: version.challengesConfiguration,
  });

  const calibratedChallenges = await calibratedChallengeRepository.findActiveFlashCompatible({
    locale,
    version,
  });
  const askedChallengeIds = assessment.answers.map((answer) => {
    answer.challengeId;
  });
  const askedChallenges = calibratedChallenges.filter(({ id }) => askedChallengeIds.includes(id));
  const scoringV3Algorithm = new ScoringV3Algorithm({
    algorithm,
    allAnswers: [...assessment.answers],
    askedChallenges,
    v3CertificationScoring,
  });
  const capacity = scoringV3Algorithm.computeCapacity({ shouldDowngradeCapacity: false });

  console.log(capacity);
  return capacity;
}
