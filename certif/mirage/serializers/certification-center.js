import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(certificationCenter) {
    return {
      'sessions': {
        related: `/api/certification-centers/${certificationCenter.id}/sessions`
      }
    };
  }
});
