import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  links(session) {
    return {
      'certifications': {
        related: `/api/sessions/${session.id}/certifications`
      }
    };
  }

});
