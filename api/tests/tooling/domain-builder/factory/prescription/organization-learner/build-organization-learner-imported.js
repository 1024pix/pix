import { OrganizationLearnerImported } from '../../../../../../src/prescription/organization-learner/domain/models/OrganizationLearnerImported.js';

const buildOrganizationLearnerImported = function ({
  id = 1,
  firstName = 'Arthur',
  lastName = 'The king',
  attributes = null,
} = {}) {
  return new OrganizationLearnerImported({
    id,
    firstName,
    lastName,
    attributes,
  });
};

export { buildOrganizationLearnerImported };
