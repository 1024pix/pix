import Controller from '@ember/controller';
import { debug } from '@ember/debug';

export default Controller.extend({
  actions: {
    addUser() {
      debug('Add user');
    }
  }

});
