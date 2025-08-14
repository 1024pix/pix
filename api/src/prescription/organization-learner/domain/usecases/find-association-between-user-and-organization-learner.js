import {
  OrganizationLearnerDisabledError,
  UserNotAuthorizedToAccessEntityError,
} from '../../../../shared/domain/errors.js';
import * as injectedRegistrationOrganizationLearnerRepository from '../../infrastructure/repositories/registration-organization-learner-repository.js';

const findAssociationBetweenUserAndOrganizationLearner = async function ({
  authenticatedUserId,
  requestedUserId,
  organizationId,
  registrationOrganizationLearnerRepository = injectedRegistrationOrganizationLearnerRepository,
} = {}) {
  if (authenticatedUserId !== requestedUserId) {
    throw new UserNotAuthorizedToAccessEntityError();
  }

  const organizationLearner = await registrationOrganizationLearnerRepository.findOneByUserIdAndOrganizationId({
    userId: authenticatedUserId,
    organizationId,
  });

  if (organizationLearner && organizationLearner.isDisabled) {
    throw new OrganizationLearnerDisabledError();
  }

  return organizationLearner;
};

export { findAssociationBetweenUserAndOrganizationLearner };
