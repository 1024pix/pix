import ApplicationSerializer from './application';

const _includes = ['areas', 'competences', 'tubes', 'skills'];

export default ApplicationSerializer.extend({
  include: _includes,

  links(targetProfile) {
    return {
      badges: {
        related: `/api/admin/target-profiles/${targetProfile.id}/badges`,
      },
      stages: {
        related: `/api/admin/target-profiles/${targetProfile.id}/stages`,
      },
    };
  },
});
