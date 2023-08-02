import { usecases } from '../../domain/usecases/index.js';
import * as complementaryCertificationSerializer from '../../infrastructure/serializers/jsonapi/complementary-certification-serializer.js';
import * as targetProfilesAttachableSerializer from '../../infrastructure/serializers/jsonapi/target-profiles-attachable-for-admin-serializer.js';

const findComplementaryCertifications = async function () {
  const complementaryCertifications = await usecases.findComplementaryCertifications();
  return complementaryCertificationSerializer.serialize(complementaryCertifications);
};

const getComplementaryCertificationTargetProfileHistory = async function (request) {
  const complementaryCertificationId = request.params.id;
  const complementaryCertification = await usecases.getComplementaryCertificationTargetProfileHistory({
    complementaryCertificationId,
  });
  return complementaryCertificationSerializer.serializeForAdmin(complementaryCertification);
};

const searchAttachableTargetProfilesForComplementaryCertifications = async function (request) {
  const searchTerm = request.query.searchTerm;
  const targetProfilesAttachable = await usecases.searchAttachableTargetProfilesForAdmin({ searchTerm });
  return targetProfilesAttachableSerializer.serialize(targetProfilesAttachable);
};

const complementaryCertificationController = {
  findComplementaryCertifications,
  getComplementaryCertificationTargetProfileHistory,
  searchAttachableTargetProfilesForComplementaryCertifications,
};
export { complementaryCertificationController };
