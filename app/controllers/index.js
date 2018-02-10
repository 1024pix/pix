import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  session: service(),

  columns: [
    { propertyName: 'firstName' },
    { propertyName: 'lastName' },
    { propertyName: 'email' },
  ],

  actions: {
    logout() {
      this.get('session').invalidate();
    }
  }
});
