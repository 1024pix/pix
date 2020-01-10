import Controller from '@ember/controller';

export default Controller.extend({

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
