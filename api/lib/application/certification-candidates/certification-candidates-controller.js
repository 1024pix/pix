const usecases = require('../../domain/usecases');
const { featureToggles } = require('../../config');
const { NotFoundError } = require('../http-errors');
const certificationCandidateSubscriptionSerializer = require('../../infrastructure/serializers/jsonapi/certification-candidate-subscription-serializer');

module.exports = {
  async authorizeToStart(request, h) {
    if (!featureToggles.isEndTestScreenRemovalEnabled) {
      throw new NotFoundError();
    }

    const authorizedToStart = request.payload['authorized-to-start'];
    const certificationCandidateForSupervisingId = request.params.id;
    await usecases.authorizeCertificationCandidateToStart({
      certificationCandidateForSupervisingId,
      authorizedToStart,
    });

    return h.response().code(204);
  },

  async authorizeToResume(request, h) {
    if (!featureToggles.isEndTestScreenRemovalEnabled) {
      throw new NotFoundError();
    }

    const certificationCandidateId = request.params.id;
    await usecases.authorizeCertificationCandidateToResume({
      certificationCandidateId,
    });

    return h.response().code(204);
  },

  async getSubscriptions(request) {
    const certificationCandidateId = request.params.id;
    const certificationCandidateSubscription = await usecases.getCertificationCandidateSubscription({
      certificationCandidateId,
    });
    return certificationCandidateSubscriptionSerializer.serialize(certificationCandidateSubscription);
  },

  async endAssessmentBySupervisor(request) {
    const certificationCandidateId = request.params.id;

    await usecases.endAssessmentBySupervisor({ certificationCandidateId });

    return null;
  },
};
