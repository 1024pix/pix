import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

import ConfirmPopup from '../confirm-popup';
import AuthenticationMethod from './user-detail-personal-information/authentication-method';

const typesLabel = {
  EMAIL: 'Adresse e-mail',
  USERNAME: 'Identifiant',
  POLE_EMPLOI: 'France Travail',
  GAR: 'Médiacentre',
  CNAV: 'CNAV',
  FWB: 'Fédération Wallonie-Bruxelles',
  PAYSDELALOIRE: 'Pays de la Loire',
};

export default class UserDetailAuthenticationMethodsComponent extends Component {
  @tracked displayRemoveAuthenticationMethodModal = false;
  @tracked isLoading = false;
  @tracked authenticationMethodType = null;

  @service notifications;

  get translatedType() {
    return typesLabel[this.authenticationMethodType];
  }

  @action
  toggleDisplayRemoveAuthenticationMethodModal(type) {
    this.authenticationMethodType = type;
    this.displayRemoveAuthenticationMethodModal = !this.displayRemoveAuthenticationMethodModal;
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
