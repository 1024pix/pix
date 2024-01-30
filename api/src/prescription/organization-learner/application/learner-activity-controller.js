import { usecases } from '../domain/usecases/index.js';

import * as organizationLearnerActivitySerializer from '../infrastructure/serializers/jsonapi/organization-learner-activity-serializer.js';

const getActivity = async function (request, h, dependencies = { organizationLearnerActivitySerializer }) {
  const organizationLearnerId = request.params.id;
  const activity = await usecases.getOrganizationLearnerActivity({ organizationLearnerId });
  return h.response(dependencies.organizationLearnerActivitySerializer.serialize(activity)).code(200);
};

const learnerActivityController = { getActivity };
export { learnerActivityController };
