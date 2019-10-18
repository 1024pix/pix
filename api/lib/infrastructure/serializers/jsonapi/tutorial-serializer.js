const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(tutorial = {}) {
    return new Serializer('tutorial', {
      attributes: [
        'duration',
        'format',
        'link',
        'source',
        'title',
        'tubeName',
        'tubePracticalTitle',
        'tubePracticalDescription',
      ],
    }).serialize(tutorial);
  },

};
