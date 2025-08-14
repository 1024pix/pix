import * as injectedBadgeRepository from '../../infrastructure/repositories/badge-repository.js';
const updateBadge = async function ({
  badgeId,
  badge: badgeDataToUpdate,
  badgeRepository = injectedBadgeRepository,
} = {}) {
  const badgeToUpdate = await badgeRepository.get(badgeId);
  badgeToUpdate.updateBadgeProperties(badgeDataToUpdate);
  return badgeRepository.update(badgeToUpdate);
};

export { updateBadge };
