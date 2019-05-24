const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(scorecard) {
    return new Serializer('scorecard', {
      attributes: [
        'name',
        'description',
        'index',
        'competenceId',
        'area',
        'earnedPix',
        'level',
        'pixScoreAheadOfNextLevel',
        'status',
        'daysBeforeReset'
      ],

      area: {
        ref: ['id'],
        attributes: ['code', 'title']
      }
    }).serialize(scorecard);
  },

};
