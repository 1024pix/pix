import Controller from '@ember/controller';

export default Controller.extend({

  //Propertiew
  sessionId:null,
  loading:false,

  // Actions
  actions: {
    onLoadSession(id) {
      this.set('sessionId', id);
      this.transitionToRoute('authenticated.certifications.sessions.details', id);
    }
  }

});
