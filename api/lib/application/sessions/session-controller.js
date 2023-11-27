import { SessionPublicationBatchError } from '../http-errors.js';
import { usecases } from '../../domain/usecases/index.js';
import { tokenService } from '../../../src/shared/domain/services/token-service.js';
import * as sessionResultsLinkService from '../../domain/services/session-results-link-service.js';
import * as sessionValidator from '../../../src/certification/session/domain/validators/session-validator.js';
import * as sessionSerializer from '../../infrastructure/serializers/jsonapi/session-serializer.js';
import * as jurySessionSerializer from '../../infrastructure/serializers/jsonapi/jury-session-serializer.js';
import * as certificationCandidateSerializer from '../../../src/certification/shared/infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import * as juryCertificationSummarySerializer from '../../infrastructure/serializers/jsonapi/jury-certification-summary-serializer.js';
import * as juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import * as jurySessionRepository from '../../infrastructure/repositories/sessions/jury-session-repository.js';
import * as queryParamsUtils from '../../infrastructure/utils/query-params-utils.js';
import * as requestResponseUtils from '../../infrastructure/utils/request-response-utils.js';
import { getSessionCertificationResultsCsv } from '../../infrastructure/utils/csv/certification-results/get-session-certification-results-csv.js';
import { fillCandidatesImportSheet } from '../../infrastructure/files/candidates-import/fill-candidates-import-sheet.js';
import lodash from 'lodash';
import { UserLinkedToCertificationCandidate } from '../../domain/events/UserLinkedToCertificationCandidate.js';
import { logger } from '../../infrastructure/logger.js';

const { trim } = lodash;

const findPaginatedFilteredJurySessions = async function (
  request,
  h,
  dependencies = {
    queryParamsUtils,
    jurySessionRepository,
    jurySessionSerializer,
    sessionValidator,
  },
) {
  const { filter, page } = dependencies.queryParamsUtils.extractParameters(request.query);
  const normalizedFilters = dependencies.sessionValidator.validateAndNormalizeFilters(filter);
  const jurySessionsForPaginatedList = await dependencies.jurySessionRepository.findPaginatedFiltered({
    filters: normalizedFilters,
    page,
  });

  return dependencies.jurySessionSerializer.serializeForPaginatedList(jurySessionsForPaginatedList);
};

const getJurySession = async function (request, h, dependencies = { jurySessionSerializer }) {
  const sessionId = request.params.id;
  const { jurySession, hasSupervisorAccess } = await usecases.getJurySession({ sessionId });

  return dependencies.jurySessionSerializer.serialize(jurySession, hasSupervisorAccess);
};

const get = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.id;
  const { session, hasSupervisorAccess, hasSomeCleaAcquired } = await usecases.getSession({ sessionId });
  return dependencies.sessionSerializer.serialize({ session, hasSupervisorAccess, hasSomeCleaAcquired });
};

const getCandidatesImportSheet = async function (
  request,
  h,
  dependencies = { tokenService, fillCandidatesImportSheet },
) {
  const translate = request.i18n.__;
  const sessionId = request.params.id;
  const token = request.query.accessToken;
  const userId = dependencies.tokenService.extractUserId(token);
  const filename = translate('candidate-list-template.filename');

  const { session, certificationCenterHabilitations, isScoCertificationCenter } =
    await usecases.getCandidateImportSheetData({
      sessionId,
      userId,
    });
  const candidateImportSheet = await dependencies.fillCandidatesImportSheet({
    session,
    certificationCenterHabilitations,
    isScoCertificationCenter,
    i18n: request.i18n,
  });

  return h
    .response(candidateImportSheet)
    .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
    .header('Content-Disposition', `attachment; filename=${filename + sessionId}.ods`);
};

const deleteCertificationCandidate = async function (request) {
  const certificationCandidateId = request.params.certificationCandidateId;

  await usecases.deleteUnlinkedCertificationCandidate({ certificationCandidateId });

  return null;
};

const getJuryCertificationSummaries = async function (
  request,
  h,
  dependencies = {
    queryParamsUtils,
    juryCertificationSummaryRepository,
    juryCertificationSummarySerializer,
  },
) {
  const sessionId = request.params.id;
  const { page } = dependencies.queryParamsUtils.extractParameters(request.query);

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

const getSessionResultsToDownload = async function (
  request,
  h,
  dependencies = { tokenService, getSessionCertificationResultsCsv },
) {
  const token = request.params.token;
  const { sessionId } = dependencies.tokenService.extractSessionId(token);
  const { session, certificationResults } = await usecases.getSessionResults({ sessionId });

  const csvResult = await dependencies.getSessionCertificationResultsCsv({
    session,
    certificationResults,
    i18n: request.i18n,
  });

  return h
    .response(csvResult.content)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${csvResult.filename}`);
};

const getSessionResultsByRecipientEmail = async function (
  request,
  h,
  dependencies = { tokenService, getSessionCertificationResultsCsv },
) {
  const token = request.params.token;

  const { resultRecipientEmail, sessionId } = dependencies.tokenService.extractResultRecipientEmailAndSessionId(token);
  const { session, certificationResults } = await usecases.getSessionResultsByResultRecipientEmail({
    sessionId,
    resultRecipientEmail,
  });
  const csvResult = await dependencies.getSessionCertificationResultsCsv({
    session,
    certificationResults,
    i18n: request.i18n,
  });

  return h
    .response(csvResult.content)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${csvResult.filename}`);
};

const importCertificationCandidatesFromCandidatesImportSheet = async function (request) {
  const sessionId = request.params.id;
  const odsBuffer = request.payload;
  const i18n = request.i18n;

  await usecases.importCertificationCandidatesFromCandidatesImportSheet({ sessionId, odsBuffer, i18n });

  return null;
};

const enrolStudentsToSession = async function (
  request,
  h,
  dependencies = { certificationCandidateSerializer, requestResponseUtils },
) {
  const referentId = dependencies.requestResponseUtils.extractUserIdFromRequest(request);
  const sessionId = request.params.id;
  const studentIds = request.deserializedPayload.organizationLearnerIds;

  await usecases.enrolStudentsToSession({ sessionId, referentId, studentIds });
  const certificationCandidates = await usecases.getSessionCertificationCandidates({ sessionId });
  const certificationCandidatesSerialized =
    dependencies.certificationCandidateSerializer.serialize(certificationCandidates);
  return h.response(certificationCandidatesSerialized).created();
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

const publish = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.id;
  const i18n = request.i18n;

  const session = await usecases.publishSession({ sessionId, i18n });

  return dependencies.sessionSerializer.serialize({ session });
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

const unpublish = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.id;

  const session = await usecases.unpublishSession({ sessionId });

  return dependencies.sessionSerializer.serialize({ session });
};

const flagResultsAsSentToPrescriber = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.id;
  const { resultsFlaggedAsSent, session } = await usecases.flagSessionResultsAsSentToPrescriber({ sessionId });
  const serializedSession = await dependencies.sessionSerializer.serialize({ session });
  return resultsFlaggedAsSent ? h.response(serializedSession).created() : serializedSession;
};

const assignCertificationOfficer = async function (request, h, dependencies = { jurySessionSerializer }) {
  const sessionId = request.params.id;
  const certificationOfficerId = request.auth.credentials.userId;
  const jurySession = await usecases.assignCertificationOfficerToJurySession({ sessionId, certificationOfficerId });
  return dependencies.jurySessionSerializer.serialize(jurySession);
};

const commentAsJury = async function (request, h) {
  const sessionId = request.params.id;
  const juryCommentAuthorId = request.auth.credentials.userId;
  const juryComment = request.payload['jury-comment'];
  await usecases.commentSessionAsJury({ sessionId, juryCommentAuthorId, juryComment });

  return h.response().code(204);
};

const deleteJuryComment = async function (request, h) {
  const sessionId = request.params.id;
  await usecases.deleteSessionJuryComment({ sessionId });

  return h.response().code(204);
};

const sessionController = {
  findPaginatedFilteredJurySessions,
  getJurySession,
  get,
  getCandidatesImportSheet,
  deleteCertificationCandidate,
  getJuryCertificationSummaries,
  generateSessionResultsDownloadLink,
  getSessionResultsToDownload,
  getSessionResultsByRecipientEmail,
  importCertificationCandidatesFromCandidatesImportSheet,
  enrolStudentsToSession,
  createCandidateParticipation,
  publish,
  publishInBatch,
  unpublish,
  flagResultsAsSentToPrescriber,
  assignCertificationOfficer,
  commentAsJury,
  deleteJuryComment,
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
