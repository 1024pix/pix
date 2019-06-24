const usecases = require('../../domain/usecases');
const sessionService = require('../../domain/services/session-service');
const sessionSerializer = require('../../infrastructure/serializers/jsonapi/session-serializer');
const certificationCourseSerializer = require('../../infrastructure/serializers/jsonapi/certification-course-serializer');
const tokenService = require('../../../lib/domain/services/token-service');

module.exports = {

  async find() {
    const session = await sessionService.find();

    return sessionSerializer.serialize(session);
  },

  async get(request) {
    const sessionId = request.params.id;
    const session = await sessionService.get(sessionId);

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
    session.id = request.params.id;

    const updatedSession = await usecases.updateSession({ userId, session });

    return sessionSerializer.serialize(updatedSession);
  },

  async getAttendanceSheet(request, h) {
    const sessionId = request.params.id;
    const token = request.query.accessToken;
    const userId = tokenService.extractUserId(token);
    const attendanceSheet = await usecases.getAttendanceSheet({ sessionId, userId });

    return h.response(attendanceSheet)
      .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
      .header('Content-Disposition', 'attachment; filename=pv-session-' + sessionId + '.ods');
  },

  async getCertificationCourses(request) {
    const userId = request.auth.credentials.userId;
    const sessionId = request.params.id;
    const certificationCourses = await usecases.findCertificationCourses({ userId, sessionId });

    return certificationCourseSerializer.serialize(certificationCourses);
  },
};
