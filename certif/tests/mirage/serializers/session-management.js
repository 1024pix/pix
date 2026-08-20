import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(session) {
    return {
      certificationReports: {
        related: `/api/sessions/${session.id}/certification-reports`,
      },
    };
  },
});
