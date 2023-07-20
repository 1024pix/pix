import { usecases } from '../../domain/usecases/index.js';
import * as complementaryCertificationSerializer from '../../infrastructure/serializers/jsonapi/complementary-certification-serializer.js';

const findComplementaryCertifications = async function () {
  const complementaryCertifications = await usecases.findComplementaryCertifications();
  return complementaryCertificationSerializer.serialize(complementaryCertifications);
};

const getTargetProfileFromComplementaryCertification = async function (request) {
  const complementaryCertificationId = request.params.id;
  const complementaryCertification = await usecases.getTargetProfileFromComplementaryCertification({
    complementaryCertificationId,
  });
  return complementaryCertificationSerializer.serializeForAdmin(complementaryCertification);
};

const complementaryCertificationController = {
  findComplementaryCertifications,
  getTargetProfileFromComplementaryCertification,
};
export { complementaryCertificationController };
