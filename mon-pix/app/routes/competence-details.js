import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),

  model(params) {
    return this.store.findRecord('scorecard', params.scorecard_id, {
      reload: true,
    });
  },

  afterModel(scorecard) {
    return scorecard.hasMany('tutorials').reload();
  },

});
