import { usecases } from '../domain/usecases/index.js';
import * as sessionSummarySerializer from '../infrastructure/serializers/session-summary-serializer.js';

async function findPaginatedFilteredSessionSummaries(request) {
  const certificationCenterId = request.params.id;
  const userId = request.auth.credentials.userId;
  const { filter, page } = request.query;

  const { models: sessionSummaries, meta } = await usecases.findPaginatedFilteredCertificationCenterSessionSummaries({
    userId,
    certificationCenterId,
    filters: filter,
    page,
  });

  return sessionSummarySerializer.serialize(sessionSummaries, meta);
}

export const certificationCenterController = {
  findPaginatedFilteredSessionSummaries,
};
