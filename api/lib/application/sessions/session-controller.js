const usecases = require('../../domain/usecases');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const certificationCandidateSerializer = require('../../infrastructure/serializers/jsonapi/certification-candidate-serializer');
const tokenService = require('../../../lib/domain/services/token-service');

module.exports = {

  async find() {
    const session = await usecases.findSessions();

    return sessionSerializer.serialize(session);
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
    const sessionId = request.params.id;
    const userId = request.auth.credentials.userId;

    return usecases.getSessionCertificationCandidates({ userId, sessionId })
      .then((certificationCandidates) => certificationCandidateSerializer.serialize(certificationCandidates));
  },

  async importCertificationCandidatesFromAttendanceSheet(request) {
    const userId = request.auth.credentials.userId;
    const sessionId = request.params.id;
    const odsBuffer = request.payload.file;

    return usecases.importCertificationCandidatesFromAttendanceSheet(
      {
        userId,
        sessionId,
        odsBuffer,
      })
      .then(() => null);
  },
};
