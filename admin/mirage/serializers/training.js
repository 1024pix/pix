import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(training) {
    return {
      targetProfileSummaries: {
        related: `/api/admin/trainings/${training.id}/target-profile-summaries`,
      },
    };
  },
});
