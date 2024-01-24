import { usecases } from '../../domain/usecases/index.js';
import * as poleEmploiService from '../../domain/services/pole-emploi-service.js';

const getSendings = async function (request, h) {
  const cursor = request.query.curseur;

  const cursorData = await poleEmploiService.decodeCursor(cursor);
  const filters = _extractFilters(request);
  const { sendings, link } = await usecases.getPoleEmploiSendings({ cursorData, filters });
  return h.response(sendings).header('link', link).code(200);
};

const poleEmploiController = { getSendings };

export { poleEmploiController };

function _extractFilters(request) {
  const filters = {};
  if (Object.keys(request.query).includes('enErreur')) {
    filters.isSuccessful = !request.query.enErreur;
  }
  return filters;
}
