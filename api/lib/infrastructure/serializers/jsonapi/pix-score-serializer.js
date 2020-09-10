const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(pixscore) {
    return new Serializer('pix-score', {
      attributes: ['value'],
    }).serialize(pixscore);
  },

};

