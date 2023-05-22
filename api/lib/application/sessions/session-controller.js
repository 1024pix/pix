import moment from 'moment';
import { BadRequestError, SessionPublicationBatchError } from '../http-errors.js';
import { usecases } from '../../domain/usecases/index.js';
import { tokenService } from '../../domain/services/token-service.js';
import * as sessionResultsLinkService from '../../domain/services/session-results-link-service.js';
import * as sessionValidator from '../../domain/validators/session-validator.js';
import * as events from '../../domain/events/index.js';
import { CertificationCandidateAlreadyLinkedToUserError } from '../../domain/errors.js';
import * as sessionSerializer from '../../infrastructure/serializers/jsonapi/session-serializer.js';
import * as jurySessionSerializer from '../../infrastructure/serializers/jsonapi/jury-session-serializer.js';
import * as certificationCandidateSerializer from '../../infrastructure/serializers/jsonapi/certification-candidate-serializer.js';
import * as certificationReportSerializer from '../../infrastructure/serializers/jsonapi/certification-report-serializer.js';
import * as juryCertificationSummarySerializer from '../../infrastructure/serializers/jsonapi/jury-certification-summary-serializer.js';
import * as juryCertificationSummaryRepository from '../../infrastructure/repositories/jury-certification-summary-repository.js';
import * as jurySessionRepository from '../../infrastructure/repositories/sessions/jury-session-repository.js';
import { extractParameters } from '../../infrastructure/utils/query-params-utils.js';
import { extractUserIdFromRequest } from '../../infrastructure/utils/request-response-utils.js';
import * as certificationResultUtils from '../../infrastructure/utils/csv/certification-results.js';
import { fillCandidatesImportSheet } from '../../infrastructure/files/candidates-import/fill-candidates-import-sheet.js';
import * as supervisorKitPdf from '../../infrastructure/utils/pdf/supervisor-kit-pdf.js';
import lodash from 'lodash';

const { trim } = lodash;

import { UserLinkedToCertificationCandidate } from '../../domain/events/UserLinkedToCertificationCandidate.js';
import { logger } from '../../infrastructure/logger.js';

const findPaginatedFilteredJurySessions = async function (
  request,
  h,
  dependencies = {
    queryParamsUtils,
    jurySessionRepository,
    jurySessionSerializer,
    sessionValidator,
  }
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

const update = async function (request, h, dependencies = { sessionSerializer }) {
  const userId = request.auth.credentials.userId;
  const session = dependencies.sessionSerializer.deserialize(request.payload);
  session.id = request.params.id;

  const updatedSession = await usecases.updateSession({ userId, session });

  return dependencies.sessionSerializer.serialize({ session: updatedSession });
};

const getAttendanceSheet = async function (request, h, dependencies = { tokenService }) {
  const sessionId = request.params.id;
  const token = request.query.accessToken;
  const userId = dependencies.tokenService.extractUserId(token);
  const attendanceSheet = await usecases.getAttendanceSheet({ sessionId, userId });

  const fileName = `feuille-emargement-session-${sessionId}.ods`;
  return h
    .response(attendanceSheet)
    .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
    .header('Content-Disposition', `attachment; filename=${fileName}`);
};

const getSupervisorKitPdf = async function (request, h, dependencies = { tokenService, supervisorKitPdf }) {
  const sessionId = request.params.id;
  const token = request.query.accessToken;
  const userId = dependencies.tokenService.extractUserId(token);
  const sessionForSupervisorKit = await usecases.getSupervisorKitSessionInfo({ sessionId, userId });

  const { buffer, fileName } = await dependencies.supervisorKitPdf.getSupervisorKitPdfBuffer({
    sessionForSupervisorKit,
  });

  return h
    .response(buffer)
    .header('Content-Disposition', `attachment; filename=${fileName}`)
    .header('Content-Type', 'application/pdf');
};

const getCandidatesImportSheet = async function (
  request,
  h,
  dependencies = { tokenService, fillCandidatesImportSheet }
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

const getCertificationCandidates = async function (request, h, dependencies = { certificationCandidateSerializer }) {
  const sessionId = request.params.id;

  const certificationCandidates = await usecases.getSessionCertificationCandidates({ sessionId });
  return dependencies.certificationCandidateSerializer.serialize(certificationCandidates);
};

const addCertificationCandidate = async function (request, h, dependencies = { certificationCandidateSerializer }) {
  const sessionId = request.params.id;
  const certificationCandidate = await dependencies.certificationCandidateSerializer.deserialize(request.payload);
  const complementaryCertifications = request.payload.data.attributes['complementary-certifications'] ?? [];
  const addedCertificationCandidate = await usecases.addCertificationCandidateToSession({
    sessionId,
    certificationCandidate,
    complementaryCertifications,
  });

  return h.response(dependencies.certificationCandidateSerializer.serialize(addedCertificationCandidate)).created();
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
  }
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
  const sessionResultsLink = dependencies.sessionResultsLinkService.generateResultsLink(sessionId);

  return h.response({ sessionResultsLink });
};

const getSessionResultsToDownload = async function (
  request,
  h,
  dependencies = { tokenService, certificationResultUtils }
) {
  const token = request.params.token;
  const { sessionId } = dependencies.tokenService.extractSessionId(token);
  const { session, certificationResults } = await usecases.getSessionResults({ sessionId });

  const csvResult = await dependencies.certificationResultUtils.getSessionCertificationResultsCsv({
    session,
    certificationResults,
  });

  const dateWithTime = moment(session.date + ' ' + session.time, 'YYYY-MM-DD HH:mm');
  const fileName = `${dateWithTime.format('YYYYMMDD_HHmm')}_resultats_session_${sessionId}.csv`;

  return h
    .response(csvResult)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${fileName}`);
};

const getSessionResultsByRecipientEmail = async function (
  request,
  h,
  dependencies = { tokenService, certificationResultUtils }
) {
  const token = request.params.token;
  const { resultRecipientEmail, sessionId } = dependencies.tokenService.extractResultRecipientEmailAndSessionId(token);
  const { session, certificationResults } = await usecases.getSessionResultsByResultRecipientEmail({
    sessionId,
    resultRecipientEmail,
  });
  const csvResult = await dependencies.certificationResultUtils.getSessionCertificationResultsCsv({
    session,
    certificationResults,
  });

  const dateWithTime = moment(session.date + ' ' + session.time, 'YYYY-MM-DD HH:mm');
  const fileName = `${dateWithTime.format('YYYYMMDD_HHmm')}_resultats_session_${sessionId}.csv`;

  return h
    .response(csvResult)
    .header('Content-Type', 'text/csv;charset=utf-8')
    .header('Content-Disposition', `attachment; filename=${fileName}`);
};

const getCertificationReports = async function (request, h, dependencies = { certificationReportSerializer }) {
  const sessionId = request.params.id;

  return usecases
    .getSessionCertificationReports({ sessionId })
    .then((certificationReports) => dependencies.certificationReportSerializer.serialize(certificationReports));
};

const importCertificationCandidatesFromCandidatesImportSheet = async function (request) {
  const sessionId = request.params.id;
  const odsBuffer = request.payload;
  const i18n = request.i18n;

  try {
    await usecases.importCertificationCandidatesFromCandidatesImportSheet({ sessionId, odsBuffer, i18n });
  } catch (err) {
    if (err instanceof CertificationCandidateAlreadyLinkedToUserError) {
      throw new BadRequestError(err.message);
    }
    throw err;
  }

  return null;
};

const enrolStudentsToSession = async function (
  request,
  h,
  dependencies = { certificationCandidateSerializer, requestResponseUtils }
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

const finalize = async function (request, h, dependencies = { certificationReportSerializer, events }) {
  const sessionId = request.params.id;
  const examinerGlobalComment = request.payload.data.attributes['examiner-global-comment'];
  const hasIncident = request.payload.data.attributes['has-incident'];
  const hasJoiningIssue = request.payload.data.attributes['has-joining-issue'];
  const certificationReports = await Promise.all(
    (request.payload.data.included || [])
      .filter((data) => data.type === 'certification-reports')
      .map((data) => dependencies.certificationReportSerializer.deserialize({ data }))
  );

  const event = await usecases.finalizeSession({
    sessionId,
    examinerGlobalComment,
    hasIncident,
    hasJoiningIssue,
    certificationReports,
  });
  await dependencies.events.eventDispatcher.dispatch(event);
  return h.response().code(200);
};

const publish = async function (request, h, dependencies = { sessionSerializer }) {
  const sessionId = request.params.id;
  const i18n = request.i18n;

  const session = await usecases.publishSession({ sessionId, i18n });

  return dependencies.sessionSerializer.serialize({ session });
};

const publishInBatch = async function (request, h) {
  const sessionIds = request.payload.data.attributes.ids;
  const result = await usecases.publishSessionsInBatch({
    sessionIds,
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

const remove = async function (request, h) {
  const sessionId = request.params.id;

  await usecases.deleteSession({ sessionId });

  return h.response().code(204);
};

const deleteJuryComment = async function (request, h) {
  const sessionId = request.params.id;
  await usecases.deleteSessionJuryComment({ sessionId });

  return h.response().code(204);
};

export {
  findPaginatedFilteredJurySessions,
  getJurySession,
  get,
  update,
  getAttendanceSheet,
  getSupervisorKitPdf,
  getCandidatesImportSheet,
  getCertificationCandidates,
  addCertificationCandidate,
  deleteCertificationCandidate,
  getJuryCertificationSummaries,
  generateSessionResultsDownloadLink,
  getSessionResultsToDownload,
  getSessionResultsByRecipientEmail,
  getCertificationReports,
  importCertificationCandidatesFromCandidatesImportSheet,
  enrolStudentsToSession,
  createCandidateParticipation,
  finalize,
  publish,
  publishInBatch,
  unpublish,
  flagResultsAsSentToPrescriber,
  assignCertificationOfficer,
  commentAsJury,
  remove,
  deleteJuryComment,
};

function _logSessionBatchPublicationErrors(result) {
  logger.warn(`One or more error occurred when publishing session in batch ${result.batchId}`);

  const sessionAndError = result.publicationErrors;
  for (const sessionId in sessionAndError) {
    logger.warn(
      {
        batchId: result.batchId,
        sessionId,
      },
      sessionAndError[sessionId].message
    );
  }
}
