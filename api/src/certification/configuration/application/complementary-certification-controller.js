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

  return h
    .response({
      data: {
        id: complementaryCertificationKey,
        type: 'certification-consolidated-framework',
      },
    })
    .code(201);
};

const calibrateConsolidatedFramework = async function (request, h) {
  const { complementaryCertificationKey } = request.params;
  const { createdAt } = request.payload.data.attributes;
  await usecases.calibrateConsolidatedFramework({ createdAt, complementaryCertificationKey });

  return h.response().code(200);
};

const complementaryCertificationController = {
  findComplementaryCertifications,
  searchAttachableTargetProfilesForComplementaryCertifications,
  createConsolidatedFramework,
  calibrateConsolidatedFramework,
};
export { complementaryCertificationController };
