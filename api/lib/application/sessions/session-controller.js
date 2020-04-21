const { BadRequestError } = require('../http-errors');
const usecases = require('../../domain/usecases');
const tokenService = require('../../domain/services/token-service');
const { CertificationCandidateAlreadyLinkedToUserError } = require('../../domain/errors');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const jurySessionSerializer = require('../../infrastructure/serializers/jsonapi/jury-session-serializer');
const certificationCandidateSerializer = require('../../infrastructure/serializers/jsonapi/certification-candidate-serializer');
const certificationReportSerializer = require('../../infrastructure/serializers/jsonapi/certification-report-serializer');
const certificationResultSerializer = require('../../infrastructure/serializers/jsonapi/certification-result-serializer');
const queryParamsUtils = require('../../infrastructure/utils/query-params-utils');

module.exports = {

  async findPaginatedFilteredJurySessions(request) {
    const options = queryParamsUtils.extractParameters(request.query);
    const { jurySessions, pagination } = await usecases.findPaginatedFilteredJurySessions({ filters: options.filter, page: options.page });

    return jurySessionSerializer.serialize(jurySessions, pagination);
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

    return h.response(attendanceSheet)
      .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
      .header('Content-Disposition', 'attachment; filename=pv-session-' + sessionId + '.ods');
  },

  async getCertificationCandidates(request) {
    const sessionId = parseInt(request.params.id);

    return usecases.getSessionCertificationCandidates({ sessionId })
      .then((certificationCandidates) => certificationCandidateSerializer.serialize(certificationCandidates));
  },

  async addCertificationCandidate(request, h) {
    const sessionId = parseInt(request.params.id);
    const certificationCandidate = await certificationCandidateSerializer.deserialize(request.payload);
    const addedCertificationCandidate = await usecases.addCertificationCandidateToSession({ sessionId, certificationCandidate });

    return h.response(certificationCandidateSerializer.serialize(addedCertificationCandidate)).created();
  },

  async deleteCertificationCandidate(request) {
    const certificationCandidateId = parseInt(request.params.certificationCandidateId);

    await usecases.deleteUnlinkedCertificationCandidate({ certificationCandidateId });

    return null;
  },

  async getCertifications(request) {
    const sessionId = request.params.id;

    const sessionCertifications = await usecases.getSessionCertifications({ sessionId });
    return certificationResultSerializer.serialize(sessionCertifications);
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
    }
    catch (err) {
      if (err instanceof CertificationCandidateAlreadyLinkedToUserError) {
        throw new BadRequestError(err.message);
      }
      throw err;
    }

    return null;
  },

  async createCandidateParticipation(request, h) {
    const userId = request.auth.credentials.userId;
    const sessionId = request.params.id;
    const firstName = request.payload.data.attributes['first-name'];
    const lastName = request.payload.data.attributes['last-name'];
    const birthdate = request.payload.data.attributes['birthdate'];

    const { linkCreated, certificationCandidate } = await usecases.linkUserToSessionCertificationCandidate({
      userId, sessionId, firstName, lastName, birthdate,
    });

    const serialized = await certificationCandidateSerializer.serialize(certificationCandidate);

    return linkCreated ? h.response(serialized).created() : serialized;
  },

  async finalize(request) {
    const sessionId = request.params.id;
    const examinerGlobalComment = request.payload.data.attributes['examiner-global-comment'];
    const certificationReports = await Promise.all(
      (request.payload.data.included || [])
        .filter((data) => data.type === 'certification-reports')
        .map((data) => certificationReportSerializer.deserialize({ data }))
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
    const session = await usecases.assignCertificationOfficerToSession({ sessionId, certificationOfficerId });
    return sessionSerializer.serialize(session);
  },

};
