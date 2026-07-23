import { TargetProfile } from '../../../domain/models/combined-course-blueprints/value-objects/TargetProfile.js';

export const findByIds = async function ({ ids, targetProfilesApi }) {
  const targetProfiles = await targetProfilesApi.getByIds(ids);
  return targetProfiles.map(toDomain);
};

const toDomain = (targetProfile) => new TargetProfile(targetProfile);
