import ApplicationSerializer from './application';

const _includes = ['schoolingRegistrations', 'authenticationMethods'];

export default ApplicationSerializer.extend({
  include: _includes,

  links(user) {
    return {
      participations: {
        related: `/api/admin/users/${user.id}/participations`,
      },
    };
  },
});
