const usecases = require('../../domain/usecases');
const accreditationSerializer = require('../../infrastructure/serializers/jsonapi/accreditation-serializer');

module.exports = {
  async findComplementaryCertifications() {
    const complementaryCertifications = await usecases.findComplementaryCertifications();
    return accreditationSerializer.serialize(complementaryCertifications);
  },
};
