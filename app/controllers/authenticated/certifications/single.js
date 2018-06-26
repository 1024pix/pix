import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default Controller.extend({
  certificationId:null,
  router:service(),
  loading:false,
  actions: {
    loadCertification(id) {
      switch (this.get("router.currentRouteName")) {
        case "authenticated.certifications.single.details":
          this.transitionToRoute("authenticated.certifications.single.details", id);
          break;
        case "authenticated.certifications.single.info":
        default:
          this.transitionToRoute("authenticated.certifications.single.info", id);
          break;
      }
    }
  }
});
