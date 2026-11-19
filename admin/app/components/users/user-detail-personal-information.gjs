import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import DeletionModal from 'pix-admin/components/ui/deletion-modal';

import ConfirmPopup from '../confirm-popup';
import OrganizationLearnerInformation from './user-detail-personal-information/organization-learner-information';

const DISSOCIATE_SUCCESS_NOTIFICATION_MESSAGE = 'La dissociation a bien été effectuée.';

export default class UserDetailPersonalInformationComponent extends Component {
  @tracked displayDissociateModal = false;
  @tracked displayDeletionLearnerModal = false;
  @tracked isLoading = false;

  @service pixToast;
  @service store;
  @service intl;

  organizationLearnerToDissociate = null;
  organizationLearnerToDelete = null;

  @action
  toggleDisplayDissociateModal(organizationLearner) {
    this.organizationLearnerToDissociate = !this.displayDissociateModal ? organizationLearner : null;
    this.displayDissociateModal = !this.displayDissociateModal;
  }

  @action
  toggleDisplayDeletionLearnerModal(organizationLearner) {
    this.organizationLearnerToDelete = !this.displayDeletionLearnerModal ? organizationLearner : null;
    this.displayDeletionLearnerModal = !this.displayDeletionLearnerModal;
  }

  get deletionWarningMessage() {
    if (!this.displayDeletionLearnerModal) return null;

    return this.intl.t('components.organization-learner-information.deletion-modal.warning-message', {
      firstName: this.organizationLearnerToDelete.firstName,
      lastName: this.organizationLearnerToDelete.lastName,
      organizationName: this.organizationLearnerToDelete.organizationName,
    });
  }

  @action
  async dissociate() {
    this.isLoading = true;
    try {
      const adapter = this.store.adapterFor('organization-learner');
      await adapter.dissociate(this.organizationLearnerToDissociate.id);
      await this.args.user.reload();
      this.pixToast.sendSuccessNotification({ message: DISSOCIATE_SUCCESS_NOTIFICATION_MESSAGE });
    } catch {
      const errorMessage = this.intl.t('common.api-error-messages.internal-server-error');
      this.pixToast.sendErrorNotification({ message: errorMessage });
    } finally {
      this.displayDissociateModal = false;
      this.isLoading = false;
    }
  }

  // delete comme ici
  @action
  async delete() {
    this.isLoading = true;
    try {
      await this.organizationLearnerToDelete.destroyRecord();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.organization-learner-information.deletion-modal.success-message'),
      });
    } catch {
      const errorMessage = this.intl.t('common.api-error-messages.internal-server-error');
      this.pixToast.sendErrorNotification({ message: errorMessage });
    } finally {
      this.displayDeletionLearnerModal = false;
      this.isLoading = false;
    }
  }

  <template>
    <section class="page-section">
      <OrganizationLearnerInformation
        @user={{@user}}
        @toggleDisplayDissociateModal={{this.toggleDisplayDissociateModal}}
        @toggleDisplayDeletionLearnerModal={{this.toggleDisplayDeletionLearnerModal}}
      />
    </section>

    {{! reuse modal }}
    <DeletionModal
      @title={{t "components.organization-learner-information.deletion-modal.title"}}
      @onCloseModal={{this.toggleDisplayDeletionLearnerModal}}
      @showModal={{this.displayDeletionLearnerModal}}
      @onTriggerAction={{this.delete}}
    >
      <:content><p>{{this.deletionWarningMessage}}</p></:content>
    </DeletionModal>

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
