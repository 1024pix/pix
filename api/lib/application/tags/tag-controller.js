const tagSerializer = require('../../infrastructure/serializers/jsonapi/tag-serializer');
const usecases = require('../../domain/usecases');

module.exports = {

  async findAllOrganizationsTags() {
    const organizationsTags = await usecases.findAllOrganizationsTags();
    return tagSerializer.serialize(organizationsTags);
  },

};
