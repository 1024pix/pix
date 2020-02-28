import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class SingleController extends Controller {

  certificationId = null;
  loading = false;

  @service router;

  @computed('certificationStatus')
  get isValid() {
    return this.certificationStatus !== 'missing-assessment';
  }

  @action
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
