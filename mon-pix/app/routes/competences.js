import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  currentUser: service(),

  model(params) {
    return this.store.findRecord(
      'scorecard',
      this.currentUser.user.id + '_' + params.competence_id
    );
  },

});
