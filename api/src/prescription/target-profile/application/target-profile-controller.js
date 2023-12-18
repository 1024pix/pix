import { usecases } from '../domain/usecases/index.js';
import * as targetProfileForSpecifierSerializer from '../infrastructure/serializers/jsonapi/target-profile-for-specifier-serializer.js';

const findTargetProfiles = async function (request, h, dependencies = { targetProfileForSpecifierSerializer }) {
  const organizationId = request.params.id;
  const targetProfiles = await usecases.getAvailableTargetProfilesForOrganization({ organizationId });
  return dependencies.targetProfileForSpecifierSerializer.serialize(targetProfiles);
};

const targetProfileController = {
  findTargetProfiles,
};

export { targetProfileController };
