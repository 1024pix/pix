import { usecases } from '../domain/usecases/index.js';
import * as attachableTargetProfilesSerializer from '../infrastructure/serializers/attachable-target-profiles-serializer.js';
import * as complementaryCertificationSerializer from '../infrastructure/serializers/complementary-certification-serializer.js';

const findComplementaryCertifications = async function () {
  const complementaryCertifications = await usecases.findComplementaryCertifications();
  return complementaryCertificationSerializer.serialize(complementaryCertifications);
};

const searchAttachableTargetProfilesForComplementaryCertifications = async function (request) {
  const searchTerm = request.query.searchTerm;
  const attachableTargetProfiles = await usecases.searchAttachableTargetProfiles({ searchTerm });
  return attachableTargetProfilesSerializer.serialize(attachableTargetProfiles);
};

const createConsolidatedFramework = async function (request, h) {
  const { complementaryCertificationKey } = request.params;
  const { tubeIds } = request.payload.data.attributes;
  await usecases.createConsolidatedFramework({ complementaryCertificationKey, tubeIds });

  return h.response().code(201);
};

const updateConsolidatedFrameworkCalibration = async function (request, h) {
  usecases.updateConsolidatedFrameworkCalibration();
  return h.response().code(200);
};

const complementaryCertificationController = {
  findComplementaryCertifications,
  searchAttachableTargetProfilesForComplementaryCertifications,
  createConsolidatedFramework,
  updateConsolidatedFrameworkCalibration,
};
export { complementaryCertificationController };
