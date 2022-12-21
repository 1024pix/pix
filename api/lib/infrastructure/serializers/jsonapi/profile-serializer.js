const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(profile = {}) {
    return new Serializer('Profile', {
      // Transform is necessary due to a bug with 'jsonapi-serializer'
      // When a nested object (here: Area) is built with a class constructor
      // in a nested object, it will skip the serialization of the area
      // But when we use plain object instead of a class then serialization works.
      transform: (profile) => ({
        ...profile,
        scorecards: profile.scorecards.map((scorecard) => {
          scorecard.area = { ...scorecard.area };
          return scorecard;
        }),
      }),
      attributes: ['pixScore', 'scorecards'],
      scorecards: {
        ref: 'id',
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
        ],
        area: {
          ref: 'id',
          attributes: ['code', 'title', 'color'],
        },
      },
    }).serialize(profile);
  },
};
