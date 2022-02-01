const usecases = require('../../domain/usecases');
const complementaryCertificationSerializer = require('../../infrastructure/serializers/jsonapi/complementary-certification-serializer');

module.exports = {
  async findComplementaryCertifications() {
    const complementaryCertifications = await usecases.findComplementaryCertifications();
    return complementaryCertificationSerializer.serialize(complementaryCertifications);
  },
};
