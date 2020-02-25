const { Serializer } = require('jsonapi-serializer');

const CertificationCenter = require('../../../domain/models/CertificationCenter');

module.exports = {

  serialize(certificationCenters, meta) {
    return new Serializer('certification-center', {
      attributes: ['id', 'name', 'type', 'externalId', 'createdAt'],
      meta,
    }).serialize(certificationCenters);
  },

  deserialize(jsonAPI) {
    return new CertificationCenter({
      id: jsonAPI.data.id,
      name: jsonAPI.data.attributes.name
    });
  },
};
