import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(user) {
    return {
      'certificationCenterMemberships': {
        related: `/api/users/${user.id}/certification-center-memberships`
      }
    };
  }
});
