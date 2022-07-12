const usecases = require('../../domain/usecases');

module.exports = {
  async updateStudentNumber(request, h) {
    const payload = request.payload.data.attributes;
    const organizationId = request.params.id;
    const studentNumber = payload['student-number'];
    const organizationLearnerId = request.params.schoolingRegistrationId;

    await usecases.updateStudentNumber({ organizationLearnerId, studentNumber, organizationId });
    return h.response().code(204);
  },
};
