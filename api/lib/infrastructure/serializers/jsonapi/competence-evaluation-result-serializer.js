const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(competenceEvaluationResult) {
    return new Serializer('competence-evaluation-result', {
      attributes: [
        'name',
        'index',
        'courseId',
        'area',
        'earnedPix',
        'level',
        'pixScoreAheadOfNextLevel'
      ],

      area: {
        ref: ['id'],
        attributes: ['code', 'title']
      }
    }).serialize(competenceEvaluationResult);
  },

};
