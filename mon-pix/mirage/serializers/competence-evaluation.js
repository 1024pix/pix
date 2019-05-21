import { JSONAPISerializer } from 'ember-cli-mirage';

export default JSONAPISerializer.extend({
  include: ['assessment'],
  links(record) {
    return {
      'scorecard': {
        related: `/api/scorecards/${record.userId}_${record.competenceId}`
      },
    };
  }
});
