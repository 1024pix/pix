import * as injectedTargetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
import * as injectedTargetProfileRepository from '../../infrastructure/repositories/target-profile-repository.js';
import { TargetProfileForCreation } from '../models/TargetProfileForCreation.js';

const copyTargetProfile = async function ({
  targetProfileId,
  targetProfileRepository = injectedTargetProfileRepository,
  targetProfileAdministrationRepository = injectedTargetProfileAdministrationRepository,
} = {}) {
  const targetProfileToCopy = await targetProfileRepository.get(targetProfileId);
  const targetProfileTubes = await targetProfileAdministrationRepository.getTubesByTargetProfileId(targetProfileId);

  const copiedTargetProfile = TargetProfileForCreation.copyTargetProfile({
    ...targetProfileToCopy,
    tubes: targetProfileTubes.map((tube) => ({
      id: tube.tubeId,
      level: tube.level,
    })),
  });

  return targetProfileAdministrationRepository.create({
    targetProfileForCreation: copiedTargetProfile,
  });
};

export { copyTargetProfile };
