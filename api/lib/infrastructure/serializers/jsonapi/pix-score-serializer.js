const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(pixscore) {
    return new Serializer('pixscores', {
      attributes: ['pixScore']
    }).serialize(pixscore);
  }

};

