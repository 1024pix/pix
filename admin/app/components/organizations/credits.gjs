import { PixButton, PixModal, PixTable, PixTableColumn, PixTag } from '@1024pix/nebulix-ember';
import { get } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';

import LotCreationForm from './credits/lot-creation-form';

export default class Credits extends Component {
  @service intl;
  @service pixToast;
  @service store;
  @service router;

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
      this.router.refresh(this.router.currentRouteName);
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

  statusColors = {
    ACTIVE: 'tertiary',
    PENDING: 'neutral',
    EXPIRED: 'error',
  };

  statusTranslations = {
    ACTIVE: this.intl.t('components.organizations.credits.table.status.ACTIVE'),
    PENDING: this.intl.t('components.organizations.credits.table.status.PENDING'),
    EXPIRED: this.intl.t('components.organizations.credits.table.status.EXPIRED'),
  };

  <template>
    <section class="page-section">
      <h2 class="page-section__title page-section__title--sub">
        {{t "pages.organization.credits.title"}}
      </h2>
      <PixButton @variant="primary" @iconBefore="add" @triggerAction={{this.openLotCreationModal}}>
        {{t "components.organizations.credits.creation.open-button"}}
      </PixButton>
    </section>
    <section class="page-section">

      <h2 class="page-section__title page-section__title--sub">{{t "components.organizations.credits.table.title"}}</h2>
      {{#if @creditsLot.length}}
        <PixTable
          @variant="admin"
          @data={{@creditsLot}}
          @caption={{t "components.organizations.credits.table.caption"}}
          class="table"
        >
          <:columns as |creditLot context|>
            <PixTableColumn @context={{context}}>
              <:header>{{t "components.organizations.credits.table.headers.count"}}</:header>
              <:cell>
                {{creditLot.count}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>{{t "components.organizations.credits.table.headers.activationDate"}}</:header>
              <:cell>
                {{formatDate creditLot.activationDate}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>{{t "components.organizations.credits.table.headers.expirationDate"}}</:header>
              <:cell>
                {{formatDate creditLot.expirationDate}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} @type="tag">
              <:header>{{t "components.organizations.credits.table.headers.status"}}</:header>
              <:cell>
                <PixTag @variant={{get this.statusColors creditLot.status}}>{{get
                    this.statusTranslations
                    creditLot.status
                  }}</PixTag>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>{{t "components.organizations.credits.table.headers.reference"}}</:header>
              <:cell>
                {{creditLot.reference}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}}>
              <:header>{{t "components.organizations.credits.table.headers.creatorFullName"}}</:header>
              <:cell>
                {{creditLot.creatorFullName}}
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>
      {{else}}
        <p class="table__empty">{{t "components.organizations.credits.table.empty"}}</p>
      {{/if}}
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
        {{#if this.isLotCreationModalOpen}}
          <LotCreationForm @onSubmit={{this.createLot}} @isLoading={{this.isLoading}} />
        {{/if}}
      </:content>
    </PixModal>
  </template>
}
