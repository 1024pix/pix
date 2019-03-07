import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  pixModalDialog: service(),

  actions: {

    closeComparisonWindow() {
      this.pixModalDialog.disableScrolling();
      window.history.back();
    }
  }
});
