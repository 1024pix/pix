import { CappedTube } from '../../../domain/models/combined-course-blueprints/value-objects/CappedTube.js';

export const findCappedTubesForTargetProfileIds = async ({ targetProfileIds, targetProfilesApi }) => {
  const cappedTubes = await targetProfilesApi.findCappedTubesForTargetProfileIds(targetProfileIds);

  return cappedTubes.map((cappedTube) => {
    return new CappedTube({ ...cappedTube });
  });
};
