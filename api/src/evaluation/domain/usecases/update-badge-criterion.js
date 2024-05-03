import { AcquiredBadgeForbiddenUpdateError } from '../errors.js';

const updateBadgeCriterion = async ({ id, badgeId, attributesToUpdate, badgeCriteriaRepository, badgeRepository }) => {
  const isBadgeAlreadyAcquired = await badgeRepository.isAssociated(badgeId);

  if (isBadgeAlreadyAcquired) {
    throw new AcquiredBadgeForbiddenUpdateError();
  }

  return badgeCriteriaRepository.updateCriterion(id, attributesToUpdate);
};

export { updateBadgeCriterion };
