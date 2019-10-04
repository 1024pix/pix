const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(scorecard, { ignoreTutorialsRelationshipData = true } = {}) {
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
        'remainingDaysBeforeReset'
      ],

      area: {
        ref: ['id'],
        attributes: ['code', 'title']
      },
      tutorials: {
        ref: 'id',
        ignoreRelationshipData: ignoreTutorialsRelationshipData,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/scorecards/${parent.id}/tutorials`;
          }
        }
      },
    }).serialize(scorecard);
  },

};
