const { Serializer } = require('jsonapi-serializer');

const CertificationCenter = require('../../../domain/models/CertificationCenter');

module.exports = {

  serialize(certificationCenter) {
    return new Serializer('certification-center', {
      attributes: ['id', 'name', 'createdAt']
    }).serialize(certificationCenter);
  },

  deserialize(json) {
    return new CertificationCenter({
      name: json.data.attributes.name
    });
  },
};
