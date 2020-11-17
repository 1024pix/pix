import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  links(targetProfile) {
    return {
      organizations: {
        related: `/api/target-profiles/${targetProfile.id}/organizations`,
      },
    };
  },
});
