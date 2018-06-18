import BaseRoute from 'pix-live/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  model(params) {
    return this.get('store').findRecord('certification', params.id, { reload: true })
      .then((certification) => {
        if (!certification.get('isPublished') || certification.get('status') !== 'validated') {
          return this.replaceWith('/mes-certifications');
        }

        return certification;
      });
  },
});
