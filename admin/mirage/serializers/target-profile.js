import ApplicationSerializer from './application';

const _includes = ['skills'];

export default ApplicationSerializer.extend({
  include: _includes,
  links(targetProfile) {
    return {
      organizations: {
        related: `/api/target-profiles/${targetProfile.id}/organizations`,
      },
    };
  },
});
