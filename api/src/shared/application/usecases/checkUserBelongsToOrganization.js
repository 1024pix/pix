import _ from 'lodash';

import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';

const execute = function (userId, organizationId, dependencies = { membershipRepository }) {
  return dependencies.membershipRepository
    .findByUserIdAndOrganizationId({ userId, organizationId })
    .then((memberships) => !_.isEmpty(memberships));
};

export { execute };
