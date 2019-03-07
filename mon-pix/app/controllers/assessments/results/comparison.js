import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  pixModalDialog: service(),

  queryParams: ['index'],
  index: null,

  actions: {

    closeComparisonWindow() {
      this.pixModalDialog.disableScrolling();
      window.history.back();
    }
  }
});
