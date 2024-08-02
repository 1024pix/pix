import { TargetProfileForCreation } from '../../../../shared/domain/models/index.js';

const copyTargetProfile = async function ({
  targetProfileId,
  targetProfileRepository,
  targetProfileAdministrationRepository,
}) {
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
