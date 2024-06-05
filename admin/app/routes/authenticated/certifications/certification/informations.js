import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import RSVP from 'rsvp';

export default class CertificationInformationsRoute extends Route {
  @service store;

  async model() {
    const certification = await this.modelFor('authenticated.certifications.certification').reload();
    const certificationIssueReports = await certification.certificationIssueReports;
    return RSVP.hash({
      certification,
      certificationIssueReports,
      countries: this.store.findAll('country'),
    });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.certificationId = model.certification.id;
    controller.certificationStatus = model.certification.status;
  }

  @action
  willTransition(transition) {
    /* eslint-disable ember/no-controller-access-in-routes */
    if (this.controller.edition && !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controller.edition = false;
      return true;
    }
    /* eslint-enable ember/no-controller-access-in-routes */
  }
}
