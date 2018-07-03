import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({

  // Properties
  certification:alias('model'),
  edition:false,

  // Actions
  actions: {
    onEdit() {
      this.set('edition', true);
    },
    onCancel() {
      this.set('edition', false);
      this.get('certification').rollbackAttributes();
    }
  }
});
