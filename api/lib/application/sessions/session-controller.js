const usecases = require('../../domain/usecases');
const sessionService = require('../../domain/services/session-service');
const serializer = require('../../infrastructure/serializers/jsonapi/session-serializer');

module.exports = {

  async find() {
    const session = await sessionService.find();

    return serializer.serialize(session);
  },

  async get(request) {
    const sessionId = request.params.id;

    const session = await sessionService.get(sessionId);

    return serializer.serialize(session);
  },

  async save(request) {
    const userId = request.auth.credentials.userId;
    const session = serializer.deserialize(request.payload);

    const newSession = await usecases.createSession({ userId, session });

    return serializer.serialize(newSession);
  },

  async update(request) {
    const userId = request.auth.credentials.userId;
    const session = serializer.deserialize(request.payload);
    session.id = request.params.id;

    const updatedSession = await usecases.updateSession({ userId, session });

    return serializer.serialize(updatedSession);
  },

  async getAttendanceSheet(request, h) {
    const sessionId = request.params.id;
    const userId = request.auth.credentials.userId;
    const attendanceSheet = await usecases.getAttendanceSheet({ sessionId, userId });

    return h.response(attendanceSheet)
      .header('Content-Type', 'application/vnd.oasis.opendocument.spreadsheet')
      .header('Content-Disposition', 'attachment; filename=pv-session-' + sessionId + '.ods');
  }
};
