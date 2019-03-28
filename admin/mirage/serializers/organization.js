import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({

  links(organization) {
    return {
      'memberships': {
        related: `/organizations/${organization.id}/memberships`
      }
    };
  }

});
