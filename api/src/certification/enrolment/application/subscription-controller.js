import { usecases } from '../domain/usecases/index.js';
import * as certificationCandidateSubscriptionSerializer from '../infrastructure/serializers/certification-candidate-subscription-serializer.js';

const getSubscription = async function (request, _h, dependencies = { certificationCandidateSubscriptionSerializer }) {
  const certificationCandidateId = request.params.id;
  const certificationCandidateSubscription = await usecases.getCertificationCandidateSubscription({
    certificationCandidateId,
  });
  return dependencies.certificationCandidateSubscriptionSerializer.serialize(certificationCandidateSubscription);
};

const subscriptionController = {
  getSubscription,
};

export { subscriptionController };
