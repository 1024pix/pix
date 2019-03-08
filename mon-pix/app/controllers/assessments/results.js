import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';
import { inject as service } from '@ember/service';

export default Controller.extend({

  urlHome: ENV.APP.HOME_HOST,

  pixModalDialog: service(),

  isShowingModal: false,
  answer: null,
  correction: null,
  challenge: null,

  actions: {
    async openComparisonWindow(answerId) {
      const store = this.get('store');

      const answer = await store.findRecord('answer', answerId);
      this.set('answer', answer);
      const challenge = await answer.get('challenge');
      this.set('challenge', challenge);
      const correction = await store.query('correction', { answerId }).then((corrections) => corrections.get('firstObject'));
      this.set('correction', correction);

      this.pixModalDialog.enableScrolling();
      this.set('isShowingModal', true);
    },

    closeComparisonWindow() {
      this.set('isShowingModal', false);
      this.pixModalDialog.disableScrolling();
    },
  }

});
