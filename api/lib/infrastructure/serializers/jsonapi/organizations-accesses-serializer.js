const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(organizationsAccesses) {
    return new Serializer('organizations-accesses', {
      attributes: ['organization'],
      organization: {
        ref: 'id',
        attributes: ['code', 'name', 'type'],
        included: true,
      }
    }).serialize(organizationsAccesses);
  }
};

