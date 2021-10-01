import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(session) {
    const links = {
      juryCertificationSummaries: {
        related: `/api/admin/sessions/${session.id}/jury-certification-summaries`,
      },
    };
    return links;
  },
});
