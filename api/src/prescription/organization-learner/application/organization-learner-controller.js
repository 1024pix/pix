import { usecases } from '../../../../src/prescription/organization-learner/domain/usecases/index.js';
import * as organizationLearnerSerializer from '../infrastructure/serializers/jsonapi/organization-learner-serializer.js';

const getLearner = async function (request, h, dependencies = { organizationLearnerSerializer }) {
  const organizationLearnerId = request.params.id;
  const learner = await usecases.getOrganizationLearner({ organizationLearnerId });

  return h.response(dependencies.organizationLearnerSerializer.serialize(learner)).code(200);
};

const organizationLearnerController = { getLearner };

export { organizationLearnerController };
