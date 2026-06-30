import { usecases } from '../../domain/usecases/index.js';
import { organizationLearnerTypeSerializer } from '../../infrastructure/serializers/jsonapi/organization-learner-type/organization-learner-type-serializer.js';

const findAllOrganizationLearnerTypes = async function (
  request,
  h,
  dependencies = { organizationLearnerTypeSerializer },
) {
  const organizationLearnerTypes = await usecases.findAllOrganizationLearnerTypes();
  return dependencies.organizationLearnerTypeSerializer.serialize(organizationLearnerTypes);
};

const organizationLearnerTypesController = { findAllOrganizationLearnerTypes };

export { organizationLearnerTypesController };
