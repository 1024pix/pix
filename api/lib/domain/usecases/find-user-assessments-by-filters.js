module.exports = function findUserAssessmentsByFilters({ userId, filters, assessmentRepository }) {

  const filtersWithUserId = Object.assign({}, filters, { userId });

  return assessmentRepository.findByFilters(filtersWithUserId);

};
