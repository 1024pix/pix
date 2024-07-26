import { usecases } from '../domain/usecases/index.js';
import * as organizationLearnerActivitySerializer from '../infrastructure/serializers/jsonapi/organization-learner-activity-serializer.js';
import * as organizationLearnerSerializer from '../infrastructure/serializers/jsonapi/organization-learner-serializer.js';

const getLearner = async function (request, h, dependencies = { organizationLearnerSerializer }) {
  const organizationLearnerId = request.params.id;
  const learner = await usecases.getOrganizationLearner({ organizationLearnerId });

  return h.response(dependencies.organizationLearnerSerializer.serialize(learner)).code(200);
};

const getActivity = async function (request, h, dependencies = { organizationLearnerActivitySerializer }) {
  const organizationLearnerId = request.params.id;
  const activity = await usecases.getOrganizationLearnerActivity({ organizationLearnerId });
  return h.response(dependencies.organizationLearnerActivitySerializer.serialize(activity)).code(200);
};

const learnerActivityController = { getActivity, getLearner };
export { learnerActivityController };
