import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewController extends Controller {

  @service notifications;

  @action
  goBackToCertificationCentersList() {
    this.transitionToRoute('authenticated.certification-centers');
  }

  @action
  async addCertificationCenter(event) {
    event.preventDefault();

    if (!this.model.externalId || !this.model.externalId.trim()) {
      this.model.externalId = null;
    }

    try {
      await this.model.save();
      this.notifications.success('Le centre de certif a été créé avec succès.');
      this.transitionToRoute('authenticated.certification-centers.list');
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
}
