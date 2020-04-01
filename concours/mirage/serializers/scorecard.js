import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attributes: [
    'name',
    'description',
    'index',
    'competenceId',
    'earnedPix',
    'level',
    'pixScoreAheadOfNextLevel',
    'status',
    'remainingDaysBeforeReset',
  ],
  include: ['area'],
  links(record) {
    return {
      'tutorials': {
        related: `/api/scorecards/${record.id}/tutorials`
      },
    };
  },
});
