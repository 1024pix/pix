const { Serializer } = require('jsonapi-serializer');
const ComplementaryCertification = require('../../../domain/models/ComplementaryCertification');

module.exports = {
  serialize(habilitation) {
    return new Serializer('habilitation', {
      attributes: ['name'],
    }).serialize(habilitation);
  },

  deserialize(jsonAPI) {
    return new ComplementaryCertification({
      id: jsonAPI.data.id,
      name: jsonAPI.data.attributes.name,
    });
  },
};
