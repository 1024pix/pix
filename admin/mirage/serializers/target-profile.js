import ApplicationSerializer from './application';

const _includes = ['areas', 'competences', 'tubes', 'skills', 'newAreas', 'badges'];

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
