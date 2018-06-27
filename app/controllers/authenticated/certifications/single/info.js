import Controller from '@ember/controller';
import { alias } from '@ember/object/computed';

export default Controller.extend({
  certification:alias('model'),
  edition:false,
  actions: {
    edit() {
      this.set("edition", true);
    },
    cancel() {
      this.set("edition", false);
      this.get("certification").rollbackAttributes();
    }
  }
});
