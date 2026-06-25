import { usecases } from '../domain/usecases/index.js';
import { organizationLearnerIdentitySerializer } from '../infrastructure/serializers/jsonapi/organization-learner-identity-serializer.js';

const findAssociation = async function (request, h, dependencies = { organizationLearnerIdentitySerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;

  const { userId, organizationId } = request.query;

  const organizationLearner = await usecases.findAssociationBetweenUserAndOrganizationLearner({
    authenticatedUserId,
    requestedUserId: userId,
    organizationId,
  });

  return h.response(dependencies.organizationLearnerIdentitySerializer.serialize(organizationLearner)).code(200);
};

const registrationOrganizationLearnerController = { findAssociation };

export { registrationOrganizationLearnerController };
