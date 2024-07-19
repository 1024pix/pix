import * as sessionValidator from '../../shared/domain/validators/session-validator.js';
import { usecases } from '../domain/usecases/index.js';
import * as jurySessionRepository from '../infrastructure/repositories/jury-session-repository.js';
import * as jurySessionSerializer from '../infrastructure/serializers/jury-session-serializer.js';
import * as sessionSerializer from '../infrastructure/serializers/session-serializer.js';

const get = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.id;
  const { session, hasSupervisorAccess, hasSomeCleaAcquired } = await usecases.getSession({ sessionId });
  return dependencies.sessionSerializer.serialize({ session, hasSupervisorAccess, hasSomeCleaAcquired });
};

const findPaginatedFilteredJurySessions = async function (
  request,
  h,
  dependencies = {
    jurySessionRepository,
    jurySessionSerializer,
    sessionValidator,
  },
) {
  const { filter, page } = request.query;
  const normalizedFilters = dependencies.sessionValidator.validateAndNormalizeFilters(filter);
  const jurySessionsForPaginatedList = await dependencies.jurySessionRepository.findPaginatedFiltered({
    filters: normalizedFilters,
    page,
  });

  return dependencies.jurySessionSerializer.serializeForPaginatedList(jurySessionsForPaginatedList);
};

const sessionController = {
  findPaginatedFilteredJurySessions,
  get,
};

export { sessionController };
