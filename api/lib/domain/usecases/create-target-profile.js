import TargetProfileForCreation from '../models/TargetProfileForCreation';
import learningContentConversionService from '../services/learning-content/learning-content-conversion-service';

export default async function createTargetProfile({
  targetProfileCreationCommand,
  domainTransaction,
  targetProfileRepository,
}) {
  const targetProfileForCreation = TargetProfileForCreation.fromCreationCommand(targetProfileCreationCommand);
  const targetProfileId = await targetProfileRepository.createWithTubes({
    targetProfileForCreation,
    domainTransaction,
  });
  const skills = await learningContentConversionService.findActiveSkillsForCappedTubes(targetProfileForCreation.tubes);
  await targetProfileRepository.updateTargetProfileWithSkills({
    targetProfileId,
    skills,
    domainTransaction,
  });
  return targetProfileId;
}
