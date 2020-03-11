module.exports = async function findPaginatedFilteredSessions({ filters, page, sessionRepository }) {
  return sessionRepository.findPaginatedFiltered({ filters, page });
};
