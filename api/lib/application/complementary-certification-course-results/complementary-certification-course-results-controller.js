const usecases = require('../../domain/usecases/index.js');

module.exports = {
  async saveJuryComplementaryCertificationCourseResult(request, h) {
    const { complementaryCertificationCourseId, juryLevel } = request.payload.data.attributes;

    await usecases.saveJuryComplementaryCertificationCourseResult({
      complementaryCertificationCourseId,
      juryLevel,
    });
    return h.response().code(200);
  },
};
