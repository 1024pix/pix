import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  session: service(),

  model() {
    return this.get('session').invalidate().then(() => {
      this.get('store').clear();
      this.transitionTo('index');
    });
  }
});
