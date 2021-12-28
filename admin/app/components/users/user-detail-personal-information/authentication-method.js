import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class AuthenticationMethod extends Component {
  @service notifications;

  @tracked showAddAuthenticationMethodModal = false;
  @tracked newEmail = '';

  @action
  toggleAddAuthenticationMethodModal() {
    this.showAddAuthenticationMethodModal = !this.showAddAuthenticationMethodModal;
  }

  @action
  async submitAddingPixAuthenticationMethod(event) {
    event.preventDefault();

    try {
      await this.args.addPixAuthenticationMethod(this.newEmail);
      this.notifications.success(`${this.newEmail} a bien été rajouté aux méthodes de connexion de l'utilisateur`);
    } catch (response) {
      this.notifications.error('Une erreur est survenue, veuillez réessayer.');
    } finally {
      this.showAddAuthenticationMethodModal = false;
      this.newEmail = '';
    }
  }
}
