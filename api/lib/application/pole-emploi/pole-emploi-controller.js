import usecases from '../../domain/usecases';

export default {
  async getSendings(request, h) {
    const cursor = request.query.curseur;
    const filters = _extractFilters(request);
    const { sendings, link } = await usecases.getPoleEmploiSendings({ cursor, filters });
    return h.response(sendings).header('link', link).code(200);
  },
};

function _extractFilters(request) {
  const filters = {};
  if (Object.keys(request.query).includes('enErreur')) {
    filters.isSuccessful = !request.query.enErreur;
  }
  return filters;
}
