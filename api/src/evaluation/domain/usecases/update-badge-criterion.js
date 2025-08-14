import * as injectedBadgeCriteriaRepository from '../../infrastructure/repositories/badge-criteria-repository.js';
import * as injectedBadgeRepository from '../../infrastructure/repositories/badge-repository.js';
import { AcquiredBadgeForbiddenUpdateError } from '../errors.js';

const updateBadgeCriterion = async ({
  id,
  badgeId,
  attributesToUpdate,
  badgeCriteriaRepository = injectedBadgeCriteriaRepository,
  badgeRepository = injectedBadgeRepository,
} = {}) => {
  const isBadgeAlreadyAcquired = await badgeRepository.isAssociated(badgeId);

  if (isBadgeAlreadyAcquired) {
    throw new AcquiredBadgeForbiddenUpdateError();
  }

  return badgeCriteriaRepository.updateCriterion(id, attributesToUpdate);
};

export { updateBadgeCriterion };
