import ApplicationSerializer from './application';

const _includes = ['areas', 'badges'];

export default ApplicationSerializer.extend({
  include: _includes,

  links(targetProfile) {
    return {
      stages: {
        related: `/api/admin/target-profiles/${targetProfile.id}/stages`,
      },
    };
  },
});
