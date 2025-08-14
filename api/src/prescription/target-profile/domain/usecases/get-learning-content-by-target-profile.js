import * as injectedLearningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
const getLearningContentByTargetProfile = async function ({
  targetProfileId,
  language,
  learningContentRepository = injectedLearningContentRepository,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
} = {}) {
  const targetProfileForAdmin = await targetProfileAdministrationRepository.get({ id: targetProfileId });
  const learningContent = await learningContentRepository.findByTargetProfileId(targetProfileId, language);
  return { learningContent, targetProfileName: targetProfileForAdmin.name };
};

export { getLearningContentByTargetProfile };
