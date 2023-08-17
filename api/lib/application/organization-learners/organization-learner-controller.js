import { usecases } from '../../domain/usecases/index.js';
import * as organizationLearnerActivitySerializer from '../../infrastructure/serializers/jsonapi/organization-learner-activity-serializer.js';
import * as organizationLearnerSerializer from '../../infrastructure/serializers/jsonapi/organization-learner-follow-up/organization-learner-serializer.js';
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

const getActivity = async function (request, h, dependencies = { organizationLearnerActivitySerializer }) {
  const organizationLearnerId = request.params.id;
  const activity = await usecases.getOrganizationLearnerActivity({ organizationLearnerId });
  return h.response(dependencies.organizationLearnerActivitySerializer.serialize(activity)).code(200);
};

const getLearner = async function (request, h, dependencies = { organizationLearnerSerializer }) {
  const organizationLearnerId = request.params.id;
  const learner = await usecases.getOrganizationLearner({ organizationLearnerId });
  return h.response(dependencies.organizationLearnerSerializer.serialize(learner)).code(200);
};

const organizationLearnerController = { dissociate, findAssociation, getActivity, getLearner };

export { organizationLearnerController };
