import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  links(session) {
    const links = {
      'certifications': {
        related: `/api/jury/sessions/${session.id}/certifications`,
      },
    };

    return links;
  }
});
