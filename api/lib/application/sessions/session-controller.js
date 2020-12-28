const { BadRequestError } = require('../http-errors');
const usecases = require('../../domain/usecases');
const tokenService = require('../../domain/services/token-service');
const sessionValidator = require('../../domain/validators/session-validator');
const { CertificationCandidateAlreadyLinkedToUserError } = require('../../domain/errors');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const jurySessionSerializer = require('../../infrastructure/serializers/jsonapi/jury-session-serializer');
const certificationCandidateSerializer = require('../../infrastructure/serializers/jsonapi/certification-candidate-serializer');
const certificationReportSerializer = require('../../infrastructure/serializers/jsonapi/certification-report-serializer');
const juryCertificationSummarySerializer = require('../../infrastructure/serializers/jsonapi/jury-certification-summary-serializer');
const juryCertificationSummaryRepository = require('../../infrastructure/repositories/jury-certification-summary-repository');
const jurySessionRepository = require('../../infrastructure/repositories/jury-session-repository');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');
const requestResponseUtils = require('../../infrastructure/utils/request-response-utils');
const { getCertificationResultsCsv } = require('../../infrastructure/utils/csv/certification-results');
const trim = require('lodash/trim');
const UserLinkedToCertificationCandidate = require('../../domain/events/UserLinkedToCertificationCandidate');
const { featureToggles } = require('../../config');

module.exports = {

  async findPaginatedFilteredJurySessions(request) {
    const currentUserId = requestResponseUtils.extractUserIdFromRequest(request);
    const { filter, page } = queryParamsUtils.extractParameters(request.query);
    const normalizedFilters
      = sessionValidator.validateAndNormalizeFilters(filter, currentUserId);
    const jurySessionsForPaginatedList = await jurySessionRepository.findPaginatedFiltered({
      filters: normalizedFilters,
      page,
    });

    return jurySessionSerializer.serializeForPaginatedList(jurySessionsForPaginatedList);
  },

  async getJurySession(request) {
    const sessionId = parseInt(request.params.id);
    const jurySession = await usecases.getJurySession({ sessionId });

    return jurySessionSerializer.serialize(jurySession);
  },

  async get(request) {
    const sessionId = parseInt(request.params.id);
    const session = await usecases.getSession({ sessionId });

    return sessionSerializer.serialize(session);
  },

  async save(request) {
    const userId = request.auth.credentials.userId;
    const session = sessionSerializer.deserialize(request.payload);

    const newSession = await usecases.createSession({ userId, session });

    return sessionSerializer.serialize(newSession);
  },

  async update(request) {
    const userId = request.auth.credentials.userId;
    const session = sessionSerializer.deserialize(request.payload);
    session.id = parseInt(request.params.id);

    const updatedSession = await usecases.updateSession({ userId, session });

    return sessionSerializer.serialize(updatedSession);
  },

  async getAttendanceSheet(request, h) {
    const sessionId = parseInt(request.params.id);
    const token = request.query.accessToken;
    const userId = tokenService.extractUserId(token);
    const attendanceSheet = await usecases.getAttendanceSheet({ sessionId, userId });

    const fileName = featureToggles.reportsCategorization ?
      `feuille-emargement-session-${sessionId}.ods` : `pv-session-${sessionId}.ods`;
    return h.response(attendanceSheet)
      .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
      .header('Content-Disposition', `attachment; filename=${fileName}`);
  },

  async getCandidatesImportSheet(request, h) {
    const sessionId = parseInt(request.params.id);
    const token = request.query.accessToken;
    const userId = tokenService.extractUserId(token);
    const candidateImportSheet = await usecases.getCandidatesImportSheet({ sessionId, userId });

    return h.response(candidateImportSheet)
      .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
      .header('Content-Disposition', 'attachment; filename=liste-candidats-session-' + sessionId + '.ods');
  },

  async getCertificationCandidates(request) {
    const sessionId = parseInt(request.params.id);

    return usecases.getSessionCertificationCandidates({ sessionId })
      .then((certificationCandidates) => certificationCandidateSerializer.serialize(certificationCandidates));
  },

  async addCertificationCandidate(request, h) {
    const sessionId = parseInt(request.params.id);
    const certificationCandidate = await certificationCandidateSerializer.deserialize(request.payload);
    const addedCertificationCandidate = await usecases.addCertificationCandidateToSession({
      sessionId,
      certificationCandidate,
    });

    return h.response(certificationCandidateSerializer.serialize(addedCertificationCandidate)).created();
  },

  async deleteCertificationCandidate(request) {
    const certificationCandidateId = parseInt(request.params.certificationCandidateId);

    await usecases.deleteUnlinkedCertificationCandidate({ certificationCandidateId });

    return null;
  },

  async getJuryCertificationSummaries(request) {
    const sessionId = request.params.id;

    const juryCertificationSummaries = await juryCertificationSummaryRepository.findBySessionId(sessionId);

    return juryCertificationSummarySerializer.serialize(juryCertificationSummaries);
  },

  async getSessionResults(request, h) {
    const sessionId = request.params.id;
    const { session, certificationResults, fileName } = await usecases.getSessionResults({ sessionId });
    const csvResult = await getCertificationResultsCsv({ session, certificationResults });

    return h.response(csvResult)
      .header('Content-Type', 'text/csv;charset=utf-8')
      .header('Content-Disposition', `attachment; filename=${fileName}`);
  },

  async getCertificationReports(request) {
    const sessionId = parseInt(request.params.id);

    return usecases.getSessionCertificationReports({ sessionId })
      .then((certificationReports) => certificationReportSerializer.serialize(certificationReports));
  },

  async importCertificationCandidatesFromAttendanceSheet(request) {
    const sessionId = parseInt(request.params.id);
    const odsBuffer = request.payload.file;

    try {
      await usecases.importCertificationCandidatesFromAttendanceSheet({ sessionId, odsBuffer });
    } catch (err) {
      if (err instanceof CertificationCandidateAlreadyLinkedToUserError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }

    return null;
  },

  async enrollStudentsToSession(request, h) {
    const referentId = requestResponseUtils.extractUserIdFromRequest(request);
    const sessionId = parseInt(request.params.id);
    const studentIds = request.payload.data.attributes['student-ids'];

    await usecases.enrollStudentsToSession({ sessionId, referentId, studentIds });
    const certificationCandidates = await usecases.getSessionCertificationCandidates({ sessionId });
    const certificationCandidatesSerialized = certificationCandidateSerializer.serialize(certificationCandidates);
    return h.response(certificationCandidatesSerialized).created();
  },

  async createCandidateParticipation(request, h) {
    const userId = request.auth.credentials.userId;
    const sessionId = request.params.id;
    const firstName = trim(request.payload.data.attributes['first-name']);
    const lastName = trim(request.payload.data.attributes['last-name']);
    const birthdate = request.payload.data.attributes['birthdate'];

    const event = await usecases.linkUserToSessionCertificationCandidate({
      userId, sessionId, firstName, lastName, birthdate,
    });

    const certificationCandidate = await usecases.getCertificationCandidate({ userId, sessionId });
    const serialized = await certificationCandidateSerializer.serialize(certificationCandidate);
    return (event instanceof UserLinkedToCertificationCandidate) ? h.response(serialized).created() : serialized;
  },

  async finalize(request) {
    const sessionId = request.params.id;
    const examinerGlobalComment = request.payload.data.attributes['examiner-global-comment'];
    const certificationReports = await Promise.all(
      (request.payload.data.included || [])
        .filter((data) => data.type === 'certification-reports')
        .map((data) => certificationReportSerializer.deserialize({ data })),
    );

    const session = await usecases.finalizeSession({ sessionId, examinerGlobalComment, certificationReports });

    return sessionSerializer.serializeForFinalization(session);
  },

  async updatePublication(request) {
    const sessionId = request.params.id;
    const toPublish = request.payload.data.attributes.toPublish;
    const session = await usecases.updatePublicationSession({ sessionId, toPublish });
    return sessionSerializer.serialize(session);
  },

  async flagResultsAsSentToPrescriber(request, h) {
    const sessionId = request.params.id;
    const { resultsFlaggedAsSent, session } = await usecases.flagSessionResultsAsSentToPrescriber({ sessionId });
    const serializedSession = await sessionSerializer.serialize(session);
    return resultsFlaggedAsSent ? h.response(serializedSession).created() : serializedSession;
  },

  async assignCertificationOfficer(request) {
    const sessionId = request.params.id;
    const certificationOfficerId = request.auth.credentials.userId;
    const jurySession = await usecases.assignCertificationOfficerToJurySession({ sessionId, certificationOfficerId });
    return jurySessionSerializer.serialize(jurySession);
  },

};
