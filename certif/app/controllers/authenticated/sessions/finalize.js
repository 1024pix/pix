import Controller from '@ember/controller';

export default Controller.extend({
  isLoading: false,

  actions: {
    finalizeSession() {
      this.set('isLoading', true);
      return this.model.finalize()
        .then(() => {
          this.set('isLoading', false);
          this.transitionToRoute('authenticated.sessions.details', this.model.id);
        });
    }
  },
});
