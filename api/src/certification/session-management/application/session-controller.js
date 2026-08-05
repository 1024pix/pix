import { getI18nFromRequest } from '../../../shared/infrastructure/i18n/i18n.js';
import * as sessionValidator from '../../shared/domain/validators/session-validator.js';
import { usecases } from '../domain/usecases/index.js';
import * as juryCertificationSummaryRepository from '../infrastructure/repositories/jury-certification-summary-repository.js';
import * as jurySessionRepository from '../infrastructure/repositories/jury-session-repository.js';
import * as juryCertificationSummarySerializer from '../infrastructure/serializers/jury-certification-summary-serializer.js';
import * as jurySessionSerializer from '../infrastructure/serializers/jury-session-serializer.js';
import * as sessionSerializer from '../infrastructure/serializers/session-serializer.js';

async function get(request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.sessionId;
  const { session, hasSomeCleaAcquired } = await usecases.getSession({ sessionId });
  return dependencies.sessionSerializer.serialize({ session, hasSomeCleaAcquired });
}

async function findPaginatedFilteredJurySessions(
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
}

async function getJurySession(request, h, dependencies = { jurySessionSerializer }) {
  const sessionId = request.params.sessionId;
  const jurySession = await usecases.getJurySession({ sessionId });

  return dependencies.jurySessionSerializer.serialize(jurySession);
}

async function getJuryCertificationSummaries(
  request,
  h,
  dependencies = {
    juryCertificationSummaryRepository,
    juryCertificationSummarySerializer,
  },
) {
  const { sessionId } = request.params;
  const { page } = request.query;
  const i18n = getI18nFromRequest(request);

  const { juryCertificationSummaries, pagination } =
    await dependencies.juryCertificationSummaryRepository.findBySessionIdPaginated({
      sessionId,
      page,
    });
  return dependencies.juryCertificationSummarySerializer.serialize(juryCertificationSummaries, pagination, {
    translate: i18n.__,
  });
}

export const sessionController = {
  getJuryCertificationSummaries,
  findPaginatedFilteredJurySessions,
  get,
  getJurySession,
};
