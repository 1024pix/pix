import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  links(session) {
    const links = {
      'certifications': {
        related: `/api/sessions/${session.id}/certifications`,
      }
    };
    if (session.certificationCenter) {
      links.certificationCenter = {
        related: `/api/certification-centers/${session.certificationCenter.id}`,
      };
    }
    if (session.assignedUser) {
      links.assignedUser = {
        related: `/api/users/${session.assignedUser.id}`,
      };
    }

    return links;
  }
});
