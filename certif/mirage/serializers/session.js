import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(session) {
    return {
      'certificationCandidates': {
        related: `/api/sessions/${session.id}/certification-candidates`,
      },
      'certificationReports': {
        related: `/api/sessions/${session.id}/certification-reports`,
      }
    };
  }
});
