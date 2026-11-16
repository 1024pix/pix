import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import LotCreationForm from './credits/lot-creation-form';

export default class Credits extends Component {
  @service intl;
  @service pixToast;
  @service store;

  @tracked isLotCreationModalOpen = false;
  @tracked isLoading = false;

  @action
  openLotCreationModal() {
    this.isLotCreationModalOpen = true;
  }

  @action
  closeLotCreationModal() {
    this.isLotCreationModalOpen = false;
  }

  @action
  async createLot(attributes) {
    this.isLoading = true;
    const creditsLot = this.store.createRecord('credits-lot', attributes);

    try {
      await creditsLot.save({ adapterOptions: { organizationId: this.args.organization.id } });

      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.organizations.credits.creation.notifications.success'),
      });
      this.closeLotCreationModal();
    } catch (responseError) {
      const message =
        responseError.errors?.[0]?.detail ??
        this.intl.t('components.organizations.credits.creation.notifications.error');

      this.pixToast.sendErrorNotification({ message });
      creditsLot.unloadRecord();
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <section class="page-section">
      <h2 class="page-section__title page-section__title--sub">
        {{t "pages.organization.credits.title"}}
      </h2>

      <PixButton @variant="primary" @iconBefore="add" @triggerAction={{this.openLotCreationModal}}>
        {{t "components.organizations.credits.creation.open-button"}}
      </PixButton>
    </section>

    <PixModal
      @title={{t "components.organizations.credits.creation.modal-title"}}
      @onCloseButtonClick={{this.closeLotCreationModal}}
      @showModal={{this.isLotCreationModalOpen}}
    >
      <:content>
        <p class="credits-lot-form__subtitle">
          {{t "components.organizations.credits.creation.modal-subtitle"}}
        </p>
        <LotCreationForm @onSubmit={{this.createLot}} @isLoading={{this.isLoading}} />
      </:content>
    </PixModal>
  </template>
}
