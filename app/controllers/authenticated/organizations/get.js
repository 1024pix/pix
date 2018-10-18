import Controller from '@ember/controller';

export default Controller.extend({

  wipModal: false,

  actions: {

    toggleWipModal() {
      this.toggleProperty('wipModal');
    },
  }

});
