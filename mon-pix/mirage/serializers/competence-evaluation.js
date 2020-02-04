import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  include: ['assessment'],
  links(record) {
    return {
      'scorecard': {
        related: `/api/scorecards/${record.userId}_${record.competenceId}`
      },
    };
  }
});
