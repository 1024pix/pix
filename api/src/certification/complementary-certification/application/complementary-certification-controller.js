import { usecases } from '../domain/usecases/index.js';
import * as complementaryCertificationSerializer from '../infrastructure/serializers/jsonapi/complementary-certification-serializer.js';

const getComplementaryCertificationTargetProfileHistory = async function (request) {
  const complementaryCertificationId = request.params.id;
  const complementaryCertification = await usecases.getComplementaryCertificationTargetProfileHistory({
    complementaryCertificationId,
  });
  return complementaryCertificationSerializer.serializeForAdmin(complementaryCertification);
};

const complementaryCertificationController = {
  getComplementaryCertificationTargetProfileHistory,
};
export { complementaryCertificationController };
