const usecases = require('../../domain/usecases');
const accreditationSerializer = require('../../infrastructure/serializers/jsonapi/accreditation-serializer');

module.exports = {
  async findAccreditations() {
    const accreditations = await usecases.findComplementaryCertifications();
    return accreditationSerializer.serialize(accreditations);
  },
};
