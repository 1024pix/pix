import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class NewController extends Controller {
  @service notifications;
  @service router;

  @action
  goBackToOrganizationList() {
    this.router.transitionTo('authenticated.organizations');
  }

  @action
  async addOrganization(event) {
    event.preventDefault();
    try {
      await this.model.save();
      this.notifications.success('L’organisation a été créée avec succès.');
      this.router.transitionTo('authenticated.organizations.get.all-tags', this.model.id);
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }
  }
}
