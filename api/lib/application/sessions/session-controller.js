import * as juryCertificationSummaryRepository from '../../../src/certification/session-management/infrastructure/repositories/jury-certification-summary-repository.js';
import * as sessionManagementSerializer from '../../../src/certification/session-management/infrastructure/serializers/session-serializer.js';
import { SessionPublicationBatchError } from '../../../src/shared/application/http-errors.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
import * as sessionResultsLinkService from '../../domain/services/session-results-link-service.js';
import { usecases } from '../../domain/usecases/index.js';
import * as juryCertificationSummarySerializer from '../../infrastructure/serializers/jsonapi/jury-certification-summary-serializer.js';

const getJuryCertificationSummaries = async function (
  request,
  h,
  dependencies = {
    juryCertificationSummaryRepository,
    juryCertificationSummarySerializer,
  },
) {
  const sessionId = request.params.id;
  const { page } = request.query;

  const { juryCertificationSummaries, pagination } =
    await dependencies.juryCertificationSummaryRepository.findBySessionIdPaginated({
      sessionId,
      page,
    });
  return dependencies.juryCertificationSummarySerializer.serialize(juryCertificationSummaries, pagination);
};

const generateSessionResultsDownloadLink = async function (request, h, dependencies = { sessionResultsLinkService }) {
  const sessionId = request.params.id;
  const i18n = request.i18n;
  const sessionResultsLink = dependencies.sessionResultsLinkService.generateResultsLink({ sessionId, i18n });

  return h.response({ sessionResultsLink });
};

const publish = async function (request, h, dependencies = { sessionManagementSerializer }) {
  const sessionId = request.params.id;
  const i18n = request.i18n;

  const session = await usecases.publishSession({ sessionId, i18n });

  return dependencies.sessionManagementSerializer.serialize({ session });
};

const publishInBatch = async function (request, h) {
  const sessionIds = request.payload.data.attributes.ids;
  const i18n = request.i18n;

  const result = await usecases.publishSessionsInBatch({
    sessionIds,
    i18n,
  });
  if (result.hasPublicationErrors()) {
    _logSessionBatchPublicationErrors(result);
    throw new SessionPublicationBatchError(result.batchId);
  }
  return h.response().code(204);
};

const unpublish = async function (request, h, dependencies = { sessionManagementSerializer }) {
  const sessionId = request.params.id;

  const session = await usecases.unpublishSession({ sessionId });

  return dependencies.sessionManagementSerializer.serialize({ session });
};

const flagResultsAsSentToPrescriber = async function (request, h, dependencies = { sessionManagementSerializer }) {
  const sessionId = request.params.id;
  const { resultsFlaggedAsSent, session } = await usecases.flagSessionResultsAsSentToPrescriber({ sessionId });
  const serializedSession = await dependencies.sessionManagementSerializer.serialize({ session });
  return resultsFlaggedAsSent ? h.response(serializedSession).created() : serializedSession;
};

const sessionController = {
  getJuryCertificationSummaries,
  generateSessionResultsDownloadLink,
  publish,
  publishInBatch,
  unpublish,
  flagResultsAsSentToPrescriber,
};

export { sessionController };

function _logSessionBatchPublicationErrors(result) {
  logger.warn(`One or more error occurred when publishing session in batch ${result.batchId}`);

  const sessionAndError = result.publicationErrors;
  for (const sessionId in sessionAndError) {
    logger.warn(
      {
        batchId: result.batchId,
        sessionId,
      },
      sessionAndError[sessionId].message,
    );
  }
}
