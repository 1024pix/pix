const { Serializer } = require('jsonapi-serializer');
const ComplementaryCertification = require('../../../domain/models/ComplementaryCertification.js');

module.exports = {
  serialize(habilitation) {
    return new Serializer('habilitation', {
      attributes: ['label', 'key'],
    }).serialize(habilitation);
  },

  deserialize(jsonAPI) {
    return new ComplementaryCertification({
      id: jsonAPI.data.id,
      label: jsonAPI.data.attributes.label,
      key: jsonAPI.data.attributes.key,
    });
  },
};
