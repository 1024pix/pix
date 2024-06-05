import ApplicationSerializer from './application';

const include = ['trainingTriggers'];

export default ApplicationSerializer.extend({
  include,
  links(training) {
    return {
      targetProfileSummaries: {
        related: `/api/admin/trainings/${training.id}/target-profile-summaries`,
      },
    };
  },
});
