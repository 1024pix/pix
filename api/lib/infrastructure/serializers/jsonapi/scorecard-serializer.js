const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(scorecard) {
    return new Serializer('scorecard', {
      attributes: [
        'name',
        'description',
        'index',
        'area',
        'earnedPix',
        'level',
        'pixScoreAheadOfNextLevel'
      ],

      area: {
        ref: ['id'],
        attributes: ['code', 'title']
      }
    }).serialize(scorecard);
  },

};
