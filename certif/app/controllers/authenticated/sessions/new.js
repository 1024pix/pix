import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    createSession(session) {
      return session.save().then(
        () => this.transitionToRoute('authenticated.sessions.details', session.id)
      );
    },

    cancel() {
      this.transitionToRoute('authenticated.sessions.list');
    },
  }
});
