export default function findPaginatedFilteredUsers({ filter, page, userRepository }) {
  return userRepository.findPaginatedFiltered({ filter, page });
}
