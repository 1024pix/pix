import * as injectedUserRepository from '../../infrastructure/repositories/user.repository.js';
const findPaginatedFilteredUsers = function ({
  filter,
  page,
  queryType,
  userRepository = injectedUserRepository,
} = {}) {
  return userRepository.findPaginatedFiltered({ filter, page, queryType });
};

export { findPaginatedFilteredUsers };
