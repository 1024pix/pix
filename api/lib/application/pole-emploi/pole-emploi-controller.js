import { usecases } from '../../domain/usecases/index.js';

const getSendings = async function (request, h) {
  const cursor = request.query.curseur;
  const filters = _extractFilters(request);
  const { sendings, link } = await usecases.getPoleEmploiSendings({ cursor, filters });
  return h.response(sendings).header('link', link).code(200);
};

export { getSendings };

function _extractFilters(request) {
  const filters = {};
  if (Object.keys(request.query).includes('enErreur')) {
    filters.isSuccessful = !request.query.enErreur;
  }
  return filters;
}
