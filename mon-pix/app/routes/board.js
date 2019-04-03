import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  async model() {
    const user = await this.store.queryRecord('user', { me: true });
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
