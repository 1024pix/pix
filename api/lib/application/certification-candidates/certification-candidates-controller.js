const usecases = require('../../domain/usecases');
const { featureToggles } = require('../../config');
const { NotFoundError } = require('../http-errors');

module.exports = {
  async update(request, h) {
    if (!featureToggles.isEndTestScreenRemovalEnabled) {
      throw new NotFoundError();
    }

    const authorizedToStart = request.payload['authorized-to-start'];
    const certificationCandidateForSupervisingId = request.params.id;
    await usecases.updateCertificationCandidateForSupervising({
      certificationCandidateForSupervisingId,
      authorizedToStart,
    });

    return h.response().code(204);
  },
};
