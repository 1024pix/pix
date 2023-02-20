import _ from 'lodash';
import membershipRepository from '../../infrastructure/repositories/membership-repository';

export default {
  execute(userId) {
    return membershipRepository.findByUserId({ userId }).then((memberships) => !_.isEmpty(memberships));
  },
};
