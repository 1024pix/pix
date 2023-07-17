import { usecases } from '../../domain/usecases/index.js';
import * as targetProfileRepository from '../../infrastructure/repositories/target-profile-management/target-profile-repository.js';
import * as targetProfileDetachOrganizationsSerializer from '../../infrastructure/serializers/jsonapi/target-profiles-management/target-profile-detach-organizations-serializer.js';
import { deserializer } from '../../infrastructure/serializers/jsonapi/deserializer.js';

const detachOrganizations = async function (
  request,
  h,
  dependencies = { targetProfileDetachOrganizationsSerializer, targetProfileRepository, deserializer },
) {
  const { organizationIds } = await dependencies.deserializer.deserialize(request.payload);
  const targetProfileId = request.params.id;

  const detachedOrganizationIds = await usecases.detachOrganizationsFromTargetProfile({
    targetProfileId,
    organizationIds,
    targetProfileRepository: dependencies.targetProfileRepository,
  });

  return h
    .response(
      dependencies.targetProfileDetachOrganizationsSerializer.serialize({ detachedOrganizationIds, targetProfileId }),
    )
    .code(200);
};

const targetProfilesManagementController = {
  detachOrganizations,
};

export { targetProfilesManagementController };
