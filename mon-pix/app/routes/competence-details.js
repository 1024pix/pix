import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  async model(params) {
    const user = await this.store.findRecord('user', this.get('session.data.authenticated.userId'));

    if (user.get('organizations.length') > 0) {
      return this.transitionTo('board');
    }

    return this.store.findRecord('scorecard', params.scorecard_id);
  },

});
