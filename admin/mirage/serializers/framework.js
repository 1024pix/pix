import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  links(framework) {
    return {
      areas: {
        related: `/api/admin/frameworks/${framework.id}/areas`,
      },
    };
  },
});
