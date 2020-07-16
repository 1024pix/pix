const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(isCertifiableAndUserIdPairs) {
    return new Serializer('isCertifiables', {
      transform({ isCertifiable, userId }) {
        return { isCertifiable, id: userId };
      },
      attributes: ['isCertifiable'],
    }).serialize(isCertifiableAndUserIdPairs);
  },

};
