import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  session: service(),

  classNames: 'menu-bar',

  actions: {
    logout() {
      this.get('session').invalidate();
    }
  }
});
