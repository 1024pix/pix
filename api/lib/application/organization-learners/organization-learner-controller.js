import { usecases } from '../../domain/usecases/index.js';
import * as organizationLearnerIdentitySerializer from '../../infrastructure/serializers/jsonapi/organization-learner-identity-serializer.js';

const dissociate = async function (request, h) {
  const organizationLearnerId = request.params.id;
  await usecases.dissociateUserFromOrganizationLearner({ organizationLearnerId });
  return h.response().code(204);
};

const findAssociation = async function (request, h, dependencies = { organizationLearnerIdentitySerializer }) {
  const authenticatedUserId = request.auth.credentials.userId;
  // eslint-disable-next-line no-restricted-syntax
  const requestedUserId = parseInt(request.query.userId);
  const campaignCode = request.query.campaignCode;

  const organizationLearner = await usecases.findAssociationBetweenUserAndOrganizationLearner({
    authenticatedUserId,
    requestedUserId,
    campaignCode,
  });

  return h.response(dependencies.organizationLearnerIdentitySerializer.serialize(organizationLearner)).code(200);
};

const organizationLearnerController = { dissociate, findAssociation };

export { organizationLearnerController };
