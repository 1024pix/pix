const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(accreditation) {
    return new Serializer('accreditation', {
      attributes: ['name'],
    }).serialize(accreditation);
  },
};
