import { logger } from '../../../../shared/infrastructure/utils/logger.js';
import { CouldNotDeleteLearnersError } from '../errors.js';

class OrganizationLearnerList {
  constructor({ organizationId, organizationLearnerIds } = {}) {
    this.organizationId = organizationId;
    this.organizationLearnerIds = organizationLearnerIds;
  }
  canDeleteOrganizationLearners(organizationLearnerIdsToValidate, userId) {
    const result = organizationLearnerIdsToValidate.filter((organizationLearnerId) => {
      return !this.organizationLearnerIds.includes(organizationLearnerId);
    });
    if (result.length !== 0) {
      logger.error(
        `User id ${userId} could not delete organization learners because learner id ${result.join(',')} don't belong to organization id ${this.organizationId} "`,
      );
      throw new CouldNotDeleteLearnersError();
    }
  }
}

export { OrganizationLearnerList };
