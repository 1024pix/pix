module.exports = function findUsers({ filters, pagination, userRepository }) {
  return userRepository.find(filters, pagination).then(({ models, pagination }) => ({
    models, pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      itemsCount: pagination.rowCount,
      pagesCount: pagination.pageCount,
    }
  }));
};
