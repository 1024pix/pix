const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(country) {
    return new Serializer('country', {
      attributes: ['code', 'name'],
      transform(country) {
        return { ...country, id: `${country.code}_${country.matcher}` };
      },
    }).serialize(country);
  },
};
