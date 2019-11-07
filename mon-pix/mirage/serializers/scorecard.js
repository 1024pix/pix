import BaseSerializer from './application';

export default BaseSerializer.extend({
  include: ['area'],
  links(record) {
    return {
      'tutorials': {
        related: `/api/scorecards/${record.userId}_${record.competenceId}/tutorials`
      },
    };
  },
});
