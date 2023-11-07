import _ from 'lodash';
import * as membershipRepository from '../../infrastructure/repositories/membership-repository.js';

const execute = function (userId) {
  return membershipRepository.findByUserId({ userId }).then((memberships) => !_.isEmpty(memberships));
};

export { execute };
