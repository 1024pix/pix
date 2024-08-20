import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

import ConfirmPopup from '../confirm-popup';
import AuthenticationMethod from './user-detail-personal-information/authentication-method';
import OrganizationLearnerInformation from './user-detail-personal-information/organization-learner-information';

const DISSOCIATE_SUCCESS_NOTIFICATION_MESSAGE = 'La dissociation a bien été effectuée.';

const typesLabel = {
  EMAIL: 'Adresse e-mail',
  USERNAME: 'Identifiant',
  POLE_EMPLOI: 'France Travail',
  GAR: 'Médiacentre',
  CNAV: 'CNAV',
  FWB: 'Fédération Wallonie-Bruxelles',
  PAYSDELALOIRE: 'Pays de la Loire',
};

export default class UserDetailPersonalInformationComponent extends Component {
  @tracked displayDissociateModal = false;
  @tracked displayRemoveAuthenticationMethodModal = false;
  @tracked isLoading = false;
  @tracked authenticationMethodType = null;

  @service notifications;

  organizationLearnerToDissociate = null;

  get translatedType() {
    return typesLabel[this.authenticationMethodType];
  }

  @action
  toggleDisplayDissociateModal(organizationLearner) {
    this.organizationLearnerToDissociate = organizationLearner;
    this.displayDissociateModal = !this.displayDissociateModal;
  }

  @action
  toggleDisplayRemoveAuthenticationMethodModal(type) {
    this.authenticationMethodType = type;
    this.displayRemoveAuthenticationMethodModal = !this.displayRemoveAuthenticationMethodModal;
  }

  @action
  async dissociate() {
    this.isLoading = true;
    try {
      await this.organizationLearnerToDissociate.destroyRecord();
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

  <template>
    <section class="page-section user-authentication-method">
      <AuthenticationMethod
        @user={{@user}}
        @toggleDisplayRemoveAuthenticationMethodModal={{this.toggleDisplayRemoveAuthenticationMethodModal}}
        @addPixAuthenticationMethod={{@addPixAuthenticationMethod}}
        @reassignAuthenticationMethod={{@reassignAuthenticationMethod}}
      />
    </section>

    <section class="page-section">
      <OrganizationLearnerInformation
        @user={{@user}}
        @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}}
      />
    </section>

    <ConfirmPopup
      @message="Êtes-vous sûr de vouloir dissocier ce prescrit ?"
      @title="Confirmer la dissociation"
      @submitTitle="Oui, je dissocie"
      @submitButtonType="danger"
      @confirm={{this.dissociate}}
      @cancel={{this.toggleDisplayDissociateModal}}
      @show={{this.displayDissociateModal}}
    />

    <ConfirmPopup
      @message="Suppression de la méthode de connexion suivante : {{this.translatedType}}"
      @title="Confirmer la suppression"
      @submitTitle="Oui, je supprime"
      @confirm={{this.removeAuthenticationMethod}}
      @cancel={{this.toggleDisplayRemoveAuthenticationMethodModal}}
      @show={{this.displayRemoveAuthenticationMethodModal}}
    />
  </template>
}
