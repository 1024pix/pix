const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(id, b64FormattedImage) {

    return new Serializer('image', {
      attributes: ['b64FormattedImage'],
    }).serialize({ b64FormattedImage, id });
  },

};
