const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(scorecard = {}) {
    return new Serializer('scorecard', {
      attributes: [
        'area',
        'competenceId',
        'description',
        'earnedPix',
        'hasNotEarnedAnything',
        'hasNotReachedLevelOne',
        'hasReachedAtLeastLevelOne',
        'index',
        'isFinished',
        'isFinishedWithMaxLevel',
        'isImprovable',
        'isMaxLevel',
        'isNotStarted',
        'isProgressable',
        'isResettable',
        'isStarted',
        'level',
        'name',
        'percentageAheadOfNextLevel',
        'pixScoreAheadOfNextLevel',
        'remainingDaysBeforeImproving',
        'remainingDaysBeforeReset',
        'remainingPixToNextLevel',
        'shouldWaitBeforeImproving',
        'status',
        'tutorials',
      ],

      area: {
        ref: ['id'],
        attributes: ['code', 'title', 'color'],
      },
      tutorials: {
        ref: 'id',
        ignoreRelationshipData: true,
        relationshipLinks: {
          related(record, current, parent) {
            return `/api/scorecards/${parent.id}/tutorials`;
          },
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
