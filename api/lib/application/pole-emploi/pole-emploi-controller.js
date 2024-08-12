import { UnprocessableEntityError } from '../../../src/shared/application/http-errors.js';
import * as poleEmploiService from '../../domain/services/pole-emploi-service.js';
import { usecases } from '../../domain/usecases/index.js';

const getSendings = async function (request, h, dependencies = { poleEmploiService }) {
  let cursorData;
  const cursor = request.query.curseur;

  try {
    cursorData = await dependencies.poleEmploiService.decodeCursor(cursor);
    const filters = _extractFilters(request);
    const { sendings, link } = await usecases.getPoleEmploiSendings({ cursorData, filters });
    return h.response(sendings).header('link', link).code(200);
  } catch (error) {
    if (error instanceof SyntaxError) throw new UnprocessableEntityError('The provided cursor is unreadable');
    throw error;
  }
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
