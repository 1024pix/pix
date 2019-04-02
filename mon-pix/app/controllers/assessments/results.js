import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';

export default Controller.extend({

  urlHome: ENV.APP.HOME_HOST,

  isShowingModal: false,
  answer: null,
  correction: null,

  actions: {
    async openComparisonWindow(answer) {
      const store = this.store;

      const correction = await store.query('correction', { answerId: answer.id }).then((corrections) => corrections.get('firstObject'));

      this.set('answer', answer);
      this.set('correction', correction);

      this.set('isShowingModal', true);
    },

    closeComparisonWindow() {
      this.set('isShowingModal', false);
    },
  }

});
