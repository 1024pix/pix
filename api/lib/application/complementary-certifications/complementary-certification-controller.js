import { usecases } from '../../domain/usecases/index.js';
import * as complementaryCertificationSerializer from '../../infrastructure/serializers/jsonapi/complementary-certification-serializer.js';

const findComplementaryCertifications = async function () {
  const complementaryCertifications = await usecases.findComplementaryCertifications();
  return complementaryCertificationSerializer.serialize(complementaryCertifications);
};

export { findComplementaryCertifications };
