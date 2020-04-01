import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: [
    'createdAt',
    'updatedAt',
    'userId',
    'competenceId',
    'status'
  ],
  include: ['assessment'],
  links(record) {
    return {
      'scorecard': {
        related: `/api/scorecards/${record.userId}_${record.competenceId}`
      },
    };
  }
});
