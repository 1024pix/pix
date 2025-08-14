import * as injectedLearningContentConversionService from '../../../../../lib/domain/services/learning-content/learning-content-conversion-service.js';
import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
const getTargetProfileContentAsJson = async function ({
  targetProfileId,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
  learningContentConversionService = injectedLearningContentConversionService,
} = {}) {
  const targetProfileForAdmin = await targetProfileAdministrationRepository.get({ id: targetProfileId });
  const skills = await learningContentConversionService.findActiveSkillsForCappedTubes(
    targetProfileForAdmin.cappedTubes,
  );
  const jsonContent = targetProfileForAdmin.getContentAsJson(skills);

  return {
    jsonContent,
    targetProfileName: targetProfileForAdmin.name,
  };
};

export { getTargetProfileContentAsJson };
