import { TargetProfileForCreation } from '../models/index.js';

const copyTargetProfile = async function ({ targetProfileId, targetProfileRepository }) {
  const targetProfileToCopy = await targetProfileRepository.get(targetProfileId);
  const tubes = await targetProfileRepository.getTubes(targetProfileId);

  const copiedTargetProfile = TargetProfileForCreation.copyTargetProfile({ ...targetProfileToCopy, tubes });

  return targetProfileRepository.create({
    targetProfileForCreation: copiedTargetProfile,
  });
};

export { copyTargetProfile };
