import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(certificationPointOfContact) {
    return {
      'sessions': {
        related: `/api/certification-centers/${certificationPointOfContact.certificationCenterId}/sessions`,
      },
    };
  },
});
