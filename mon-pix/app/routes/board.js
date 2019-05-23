import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),

  async model() {
    const user = this.currentUser.user;

    // If the organizations are not included in the JSON-API's response, the relationship
    // is a promise to EmberData, hence we must keep the await here
    const organizations = await user.organizations;

    if (!organizations.length) {
      return this.transitionTo('index');
    }

    const organization = organizations.get('firstObject');

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
  }
});
