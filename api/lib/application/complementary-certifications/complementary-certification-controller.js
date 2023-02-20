import usecases from '../../domain/usecases';
import complementaryCertificationSerializer from '../../infrastructure/serializers/jsonapi/complementary-certification-serializer';

export default {
  async findComplementaryCertifications() {
    const complementaryCertifications = await usecases.findComplementaryCertifications();
    return complementaryCertificationSerializer.serialize(complementaryCertifications);
  },
};
