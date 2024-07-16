import { usecases } from '../../domain/usecases/index.js';
import * as attachableTargetProfilesSerializer from '../../infrastructure/serializers/jsonapi/attachable-target-profiles-serializer.js';

const searchAttachableTargetProfilesForComplementaryCertifications = async function (request) {
  const searchTerm = request.query.searchTerm;
  const attachableTargetProfiles = await usecases.searchAttachableTargetProfiles({ searchTerm });
  return attachableTargetProfilesSerializer.serialize(attachableTargetProfiles);
};

const complementaryCertificationController = {
  searchAttachableTargetProfilesForComplementaryCertifications,
};
export { complementaryCertificationController };
