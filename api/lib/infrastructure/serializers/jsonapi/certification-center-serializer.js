const { Serializer } = require('jsonapi-serializer');

const CertificationCenter = require('../../../domain/models/CertificationCenter');

module.exports = {

  serialize(certificationCenter) {
    return new Serializer('certification-center', {
      attributes: ['id', 'name', 'createdAt']
    }).serialize(certificationCenter);
  },

  deserialize(jsonAPI) {
    return new CertificationCenter({
      id: jsonAPI.data.id,
      name: jsonAPI.data.attributes.name
    });
  },
};
