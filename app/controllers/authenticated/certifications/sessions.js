import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({

  //Propertiew
  sessionId:null,
  loading:false,

  // Private properties
  router:service(),

  // Actions
  actions: {
    onLoadSession(id) {
      this.set('sessionId', id);
      switch (this.get('router.currentRouteName')) {
        case 'authenticated.certifications.sessions.info.list':
          this.transitionToRoute('authenticated.certifications.sessions.info.list', id);
          break;
        case 'authenticated.certifications.sessions.info':
        default:
          this.transitionToRoute('authenticated.certifications.sessions.info', id);
          break;
      }
    }
  }

});
