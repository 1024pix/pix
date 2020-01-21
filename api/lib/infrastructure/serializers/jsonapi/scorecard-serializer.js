const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(scorecard = {}) {
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
        'remainingDaysBeforeReset',
        'tutorials',
      ],

      area: {
        ref: ['id'],
        attributes: ['code', 'title', 'color']
      },
      tutorials: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/scorecards/${parent.id}/tutorials`;
          }
        },
        attributes: [
          'id',
          'duration',
          'format',
          'link',
          'source',
          'title',
          'tubeName',
          'tubePracticalTitle',
          'tubePracticalDescription',
        ],
      },
    }).serialize(scorecard);
  },

};
