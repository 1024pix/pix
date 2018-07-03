import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({

  // Properties
  certification:alias('model'),
  edition:false,

  // Actions
  actions: {
    edit() {
      this.set('edition', true);
    },
    cancel() {
      this.set('edition', false);
      this.get('certification').rollbackAttributes();
    }
  }
});
