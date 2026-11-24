import { RecommendedModule } from '../read-models/RecommendedModule.js';
import moduleService from '../services/module-service.js';

export const findRecommendedModulesByCampaignParticipationIds = async function ({
  campaignParticipationIds,
  moduleMetadataRepository,
  userRecommendedTrainingRepository,
  isForMultipleLearners = false,
  logger,
}) {
  const userRecommendedTrainings = await userRecommendedTrainingRepository.findModulesByCampaignParticipationIds({
    campaignParticipationIds,
    isForMultipleLearners,
  });
  const userRecommendedModules = await Promise.all(
    userRecommendedTrainings.map(async ({ id, link, campaignParticipationId }) => {
      try {
        const module = await moduleService.getModuleByLink({ link, moduleMetadataRepository });
        return { id, moduleId: module.id, shortId: module.shortId, campaignParticipationId };
      } catch {
        logger.error({ message: `Erreur sur le lien de la ressource : ${link}` });
        return;
      }
    }),
  );

  return userRecommendedModules.filter((module) => module !== undefined).map((module) => new RecommendedModule(module));
};
