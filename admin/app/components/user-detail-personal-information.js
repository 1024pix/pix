import Component from '@glimmer/component';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

const DISSOCIATE_SUCCESS_NOTIFICATION_MESSAGE = 'La dissociation a bien été effectuée.';

const typesLabel = {
  EMAIL: 'Adresse e-mail',
  USERNAME: 'Identifiant',
  POLE_EMPLOI: 'Pôle Emploi',
  GAR: 'Médiacentre',
};

export default class UserDetailPersonalInformationComponent extends Component {
  @tracked displayAnonymizeModal = false;
  @tracked displayDissociateModal = false;
  @tracked displayRemoveAuthenticationMethodModal = false;
  @tracked isLoading = false;
  @tracked authenticationMethodType = null;

  @service notifications;

  schoolingRegistrationToDissociate = null;

  get translatedType() {
    return typesLabel[this.authenticationMethodType];
  }

  @action
  toggleDisplayAnonymizeModal() {
    this.displayAnonymizeModal = !this.displayAnonymizeModal;
  }

  @action
  toggleDisplayDissociateModal(schoolingRegistration) {
    this.schoolingRegistrationToDissociate = schoolingRegistration;
    this.displayDissociateModal = !this.displayDissociateModal;
  }

  @action
  toggleDisplayRemoveAuthenticationMethodModal(type) {
    this.authenticationMethodType = type;
    this.displayRemoveAuthenticationMethodModal = !this.displayRemoveAuthenticationMethodModal;
  }

  @action
  async anonymizeUser() {
    await this.args.user.save({ adapterOptions: { anonymizeUser: true } });
    this.toggleDisplayAnonymizeModal();
  }

  @action
  async dissociate() {
    this.isLoading = true;
    try {
      await this.schoolingRegistrationToDissociate.destroyRecord();
      this.notifications.success(DISSOCIATE_SUCCESS_NOTIFICATION_MESSAGE);
    } catch (response) {
      const errorMessage = 'Une erreur est survenue !';
      this.notifications.error(errorMessage);
    } finally {
      this.displayDissociateModal = false;
      this.isLoading = false;
    }
  }

  @action
  async removeAuthenticationMethod() {
    this.isLoading = true;
    try {
      await this.args.removeAuthenticationMethod(this.authenticationMethodType);
    } catch (response) {
      let errorMessage = 'Une erreur est survenue !';
      if (get(response, 'errors[0].status') === '403') {
        errorMessage = 'Vous ne pouvez pas supprimer la dernière méthode de connexion de cet utilisateur';
      }
      this.notifications.error(errorMessage);
    } finally {
      this.isLoading = false;
      this.toggleDisplayRemoveAuthenticationMethodModal(null);
    }
  }
}
