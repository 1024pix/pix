import * as injectedCampaignRepository from '../../../prescription/campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedKnowledgeElementRepository from '../../../shared/infrastructure/repositories/knowledge-element-repository.js';
import * as injectedTrainingRepository from '../../infrastructure/repositories/training-repository.js';
import * as injectedUserRecommendedTrainingRepository from '../../infrastructure/repositories/user-recommended-training-repository.js';
const handleTrainingRecommendation = async function ({
  locale,
  assessment,
  campaignRepository = injectedCampaignRepository,
  knowledgeElementRepository = injectedKnowledgeElementRepository,
  trainingRepository = injectedTrainingRepository,
  userRecommendedTrainingRepository = injectedUserRecommendedTrainingRepository,
} = {}) {
  if (!assessment.isForCampaign()) {
    return;
  }
  const { campaignParticipationId } = assessment;
  const trainings = await trainingRepository.findWithTriggersByCampaignParticipationIdAndLocale({
    campaignParticipationId,
    locale,
  });

  if (trainings.length === 0) {
    return;
  }

  const campaignSkills = await campaignRepository.findSkillsByCampaignParticipationId({
    campaignParticipationId,
  });
  const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: assessment.userId,
  });

  for (const training of trainings) {
    if (training.shouldBeObtained(knowledgeElements, campaignSkills)) {
      await userRecommendedTrainingRepository.save({
        userId: assessment.userId,
        trainingId: training.id,
        campaignParticipationId,
      });
    }
  }
  return;
};

export { handleTrainingRecommendation };
