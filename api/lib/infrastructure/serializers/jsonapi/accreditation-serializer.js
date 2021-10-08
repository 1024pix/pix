const { Serializer } = require('jsonapi-serializer');

const Accreditation = require('../../../domain/models/Accreditation');

module.exports = {
  serialize(accreditation) {
    return new Serializer('accreditation', {
      attributes: ['name'],
    }).serialize(accreditation);
  },

  deserialize(jsonAPI) {
    return new Accreditation({
      id: jsonAPI.data.id,
      name: jsonAPI.data.attributes.name,
    });
  },
};
