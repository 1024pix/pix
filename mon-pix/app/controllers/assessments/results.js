import Controller from '@ember/controller';
import ENV from 'mon-pix/config/environment';

export default Controller.extend({

  urlHome: ENV.APP.HOME_HOST,

  isShowingModal: false,
  answer: null,
  pageTitle: 'Fin de test de démo',

  actions: {
    openComparisonWindow(answer) {
      this.set('answer', answer);
      this.set('isShowingModal', true);
    },

    closeComparisonWindow() {
      this.set('isShowingModal', false);
    },
  }
});
