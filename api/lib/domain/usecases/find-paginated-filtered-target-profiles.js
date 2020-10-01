module.exports = function findPaginatedFilteredTargetProfiles({ filter, page, targetProfileRepository }) {
  return targetProfileRepository.findPaginatedFiltered({ filter, page });
};
