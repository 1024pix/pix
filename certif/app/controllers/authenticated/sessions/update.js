import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    updateSession(session) {
      return session.save().then(
        () => this.transitionToRoute('authenticated.sessions.details', session.id)
      );
    },

    cancel(session) {
      this.transitionToRoute('authenticated.sessions.details', session.id);
    },
  }
});
