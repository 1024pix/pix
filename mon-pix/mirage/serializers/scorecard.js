import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  include: ['area'],
  links(record) {
    return {
      tutorials: {
        related: `/api/scorecards/${record.id}/tutorials`,
      },
    };
  },
});
