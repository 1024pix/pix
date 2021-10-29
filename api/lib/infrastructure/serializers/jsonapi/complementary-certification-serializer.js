const { Serializer } = require('jsonapi-serializer');
const ComplementaryCertification = require('../../../domain/models/ComplementaryCertification');

module.exports = {
  serialize(accreditation) {
    return new Serializer('accreditation', {
      attributes: ['name'],
    }).serialize(accreditation);
  },

  deserialize(jsonAPI) {
    return new ComplementaryCertification({
      id: jsonAPI.data.id,
      name: jsonAPI.data.attributes.name,
    });
  },
};
