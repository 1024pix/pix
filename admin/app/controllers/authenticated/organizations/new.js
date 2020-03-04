import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class NewController extends Controller {

  @service notifications;

  @action
  goBackToOrganizationList() {
    this.transitionToRoute('authenticated.organizations');
  }

  @action
  async addOrganization(event) {
    event.preventDefault();
    try {
      await this.model.save();
      this.notifications.success('L’organisation a été créée avec succès.');
      this.transitionToRoute('authenticated.organizations.get', this.model.id);
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
}
