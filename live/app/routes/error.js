import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import _ from 'lodash';

export default Route.extend({

  session: service(),

  hasUnauthorizedError(error) {
    const statusCode = _.get(error, 'errors[0].code');
    return statusCode === 401;
  },

  setupController(controller, error) {
    this._super(...arguments);

    if (this.hasUnauthorizedError(error)) {
      return this.get('session').invalidate()
        .then(() => this.transitionTo('login'));
    }
  }

});
