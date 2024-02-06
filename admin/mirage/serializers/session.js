import ApplicationSerializer from './application';

const _includes = ['assignedCertificationOfficer'];

export default ApplicationSerializer.extend({
  include: _includes,
  links(session) {
    const links = {
      juryCertificationSummaries: {
        related: `/api/admin/sessions/${session.id}/jury-certification-summaries`,
      },
    };
    return links;
  },
});
