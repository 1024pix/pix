import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ConfirmPopup from '../confirm-popup';
import OrganizationLearnerInformation from './user-detail-personal-information/organization-learner-information';

const DISSOCIATE_SUCCESS_NOTIFICATION_MESSAGE = 'La dissociation a bien été effectuée.';

export default class UserDetailPersonalInformationComponent extends Component {
  @tracked displayDissociateModal = false;
  @tracked isLoading = false;

  @service notifications;

  organizationLearnerToDissociate = null;

  @action
  toggleDisplayDissociateModal(organizationLearner) {
    this.organizationLearnerToDissociate = organizationLearner;
    this.displayDissociateModal = !this.displayDissociateModal;
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

  <template>
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
  </template>
}
