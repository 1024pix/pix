import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),

  async model() {
    const user = this.currentUser.user;

    if (!user.isBoardOrganization) {
      return this.transitionTo('index');
    }

    return RSVP.hash({
      organization: this.store.findRecord('organization', user.boardOrganizationId),
      snapshots: this.store.query('snapshot', {
        filter: {
          organizationId: user.boardOrganizationId,
        },
        page: {
          number: 1,
          size: 200,
        },
        sort: '-createdAt',
        include: 'user',
      }),
    });
  }
});
