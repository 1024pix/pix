import _ from 'lodash';
import membershipRepository from '../../infrastructure/repositories/membership-repository';

export default {
  execute(userId, organizationId) {
    return membershipRepository
      .findByUserIdAndOrganizationId({ userId, organizationId })
      .then((memberships) => !_.isEmpty(memberships));
  },
};
