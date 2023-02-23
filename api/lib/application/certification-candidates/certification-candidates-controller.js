const usecases = require('../../domain/usecases/index.js');
const certificationCandidateSubscriptionSerializer = require('../../infrastructure/serializers/jsonapi/certification-candidate-subscription-serializer');

module.exports = {
  async authorizeToStart(request, h) {
    const certificationCandidateForSupervisingId = request.params.id;

    const authorizedToStart = request.payload['authorized-to-start'];
    await usecases.authorizeCertificationCandidateToStart({
      certificationCandidateForSupervisingId,
      authorizedToStart,
    });

    return h.response().code(204);
  },

  async authorizeToResume(request, h) {
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
