const findPaginatedFilteredUsers = function ({ filter, page, userRepository }) {
  return userRepository.findPaginatedFiltered({ filter, page });
};

export { findPaginatedFilteredUsers };
