import lodash from 'lodash';

import * as sessionManagementSerializer from '../../../src/certification/session-management/infrastructure/serializers/session-serializer.js';
import * as certificationCandidateSerializer from '../../../src/certification/shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import { logger } from '../../../src/shared/infrastructure/utils/logger.js';
import { UserLinkedToCertificationCandidate } from '../../domain/events/UserLinkedToCertificationCandidate.js';
import * as sessionResultsLinkService from '../../domain/services/session-results-link-service.js';
import { usecases } from '../../domain/usecases/index.js';
import * as juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import * as juryCertificationSummarySerializer from '../../infrastructure/serializers/jsonapi/jury-certification-summary-serializer.js';
import { SessionPublicationBatchError } from '../http-errors.js';

const { trim } = lodash;

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

const createCandidateParticipation = async function (request, h, dependencies = { certificationCandidateSerializer }) {
  const userId = request.auth.credentials.userId;
  const sessionId = request.params.id;
  const firstName = trim(request.payload.data.attributes['first-name']);
  const lastName = trim(request.payload.data.attributes['last-name']);
  const birthdate = request.payload.data.attributes['birthdate'];

  const event = await usecases.linkUserToSessionCertificationCandidate({
    userId,
    sessionId,
    firstName,
    lastName,
    birthdate,
  });

  const certificationCandidate = await usecases.getCertificationCandidate({ userId, sessionId });
  const serialized = await dependencies.certificationCandidateSerializer.serialize(certificationCandidate);
  return event instanceof UserLinkedToCertificationCandidate ? h.response(serialized).created() : serialized;
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
  createCandidateParticipation,
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
