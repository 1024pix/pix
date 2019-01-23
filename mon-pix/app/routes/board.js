import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';
import RSVP from 'rsvp';

export default BaseRoute.extend(AuthenticatedRouteMixin, {
  session: service(),

  model() {
    return this.store.findRecord('user', this.get('session.data.authenticated.userId'))
      .then((user) => {
        if (user.get('organizations.length') <= 0) {
          return this.transitionTo('compte');
        }

        const organization = user.get('organizations.firstObject');

        return RSVP.hash({
          organization,
          snapshots: this.store.query('snapshot', {
            filter: {
              organizationId: organization.id,
            },
            page: {
              number: 1,
              size: 200,
            },
            sort: '-createdAt',
            include: 'user',
          }),
        });
      });
  }
});
