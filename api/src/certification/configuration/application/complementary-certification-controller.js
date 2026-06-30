import { usecases } from '../domain/usecases/index.js';
import * as attachableTargetProfilesSerializer from '../infrastructure/serializers/attachable-target-profiles-serializer.js';
import * as complementaryCertificationSerializer from '../infrastructure/serializers/complementary-certification-serializer.js';

async function findComplementaryCertifications() {
  const complementaryCertifications = await usecases.findComplementaryCertifications();
  return complementaryCertificationSerializer.serialize(complementaryCertifications);
}

async function searchAttachableTargetProfilesForComplementaryCertifications(request) {
  const searchTerm = request.query.searchTerm;
  const attachableTargetProfiles = await usecases.searchAttachableTargetProfiles({ searchTerm });
  return attachableTargetProfilesSerializer.serialize(attachableTargetProfiles);
}

async function getComplementaryCertificationTargetProfileHistory(request) {
  const complementaryCertificationKey = request.params.complementaryCertificationKey;
  const complementaryCertification = await usecases.getComplementaryCertificationTargetProfileHistory({
    complementaryCertificationKey,
  });
  return complementaryCertificationSerializer.serializeForAdmin(complementaryCertification);
}

export const complementaryCertificationController = {
  findComplementaryCertifications,
  getComplementaryCertificationTargetProfileHistory,
  searchAttachableTargetProfilesForComplementaryCertifications,
};
