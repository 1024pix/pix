module.exports = function({ userId, filters, assessmentRepository }) {

  const filtersWithUserId = Object.assign({}, filters, { userId });

  return assessmentRepository.findByFilters(filtersWithUserId);

};
