import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';

export default Controller.extend({

  //Properties
  certificationId: null,
  loading: false,

  // Private properties
  router: service(),

  isValid: computed('certificationStatus', function() {
    return this.certificationStatus !== 'missing-assessment';
  }),

  // Actions
  actions: {
    onLoadCertification(id) {
      this.set('certificationId', id);
      switch (this.get('router.currentRouteName')) {
        case 'authenticated.certifications.single.details':
          this.transitionToRoute('authenticated.certifications.single.details', id);
          break;
        case 'authenticated.certifications.single.info':
        default:
          this.transitionToRoute('authenticated.certifications.single.info', id);
          break;
      }
    }
  }
});
