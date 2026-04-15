import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn, uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { formatDate, t } from 'ember-intl';
import { not } from 'ember-truth-helpers';
import ActivityType from 'pix-orga/components/activity-type';

import InElement from '../in-element';
import SelectableList from '../selectable-list';
import UiActionBar from '../ui/action-bar';
import UiDeletionModal from '../ui/deletion-modal';
import CampaignFilters from './filter/campaign-filters';

async function withFunction(wrappedFunction, func, ...args) {
  func(...args);
  await wrappedFunction(...args);
}

function stopPropagation(event) {
  event.stopPropagation();
}

export default class List extends Component {
  @service intl;
  @service locale;
  @service store;
  @service pixToast;
  @tracked showDeletionModal = false;

  get canDelete() {
    return this.args.canDelete ?? false;
  }

  get displayEmptyResult() {
    return this.args.campaigns.length === 0;
  }

  @action
  toggleDeletionModal() {
    this.showDeletionModal = !this.showDeletionModal;
  }

  @action
  async deleteCampaigns(selectedCampaigns) {
    const campaignIds = selectedCampaigns.map(({ id }) => id);
    try {
      this.toggleDeletionModal();
      await this.store.adapterFor('campaign').delete(this.args.organizationId, campaignIds);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.campaigns-list.action-bar.success-message', {
          count: selectedCampaigns.length,
        }),
      });
      this.args.onDeleteCampaigns();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.campaigns-list.action-bar.error-message', {
          count: selectedCampaigns.length,
        }),
      });
    }
  }

  <template>
    {{#let (uniqueId) (uniqueId) (uniqueId) (uniqueId) as |actionBarId paginationId headerId filtersId|}}
      <div id={{filtersId}} />
      <SelectableList
        @items={{@campaigns}}
        as |toggleCampaign isCampaignSelected allSelected someSelected toggleAll selectedCampaigns reset|
      >
        <PixTable
          @variant="orga"
          @caption={{@caption}}
          @data={{@campaigns}}
          class="table"
          @onRowClick={{@onClickCampaign}}
        >
          <:columns as |campaign context|>
            {{#if this.canDelete}}
              <PixTableColumn @context={{context}}>
                <:header>
                  <PixCheckbox
                    @screenReaderOnly={{true}}
                    @checked={{someSelected}}
                    @isIndeterminate={{not allSelected}}
                    disabled={{not @campaigns.length}}
                    {{on "click" toggleAll}}
                  >
                    <:label>{{t "pages.campaigns-list.table.column.mainCheckbox"}}</:label>
                  </PixCheckbox>
                </:header>
                <:cell>
                  <span {{on "click" (fn withFunction (fn toggleCampaign campaign) stopPropagation)}}>
                    <PixCheckbox
                      {{on "click" (fn withFunction (fn toggleCampaign campaign) stopPropagation)}}
                      @checked={{isCampaignSelected campaign}}
                    />
                  </span>
                </:cell>
              </PixTableColumn>
            {{/if}}

            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.campaigns-list.table.column.name"}}
              </:header>
              <:cell>
                <span class="table__link-cell">
                  <ActivityType @labels={{this.labels}} @type={{campaign.type}} @hideLabel={{true}} />
                  <LinkTo @route="authenticated.campaigns.campaign" @model={{campaign.id}}>
                    {{campaign.name}}
                  </LinkTo>
                </span>
              </:cell>
            </PixTableColumn>

            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.campaigns-list.table.column.code"}}
              </:header>
              <:cell>
                {{#unless campaign.isFromCombinedCourse}}
                  <span {{on "click" stopPropagation}}>{{campaign.code}}</span>
                {{/unless}}
              </:cell>
            </PixTableColumn>

            {{#if @showCampaignOwner}}
              <PixTableColumn @context={{context}}>
                <:header>
                  {{t "pages.campaigns-list.table.column.created-by"}}
                </:header>
                <:cell>
                  {{campaign.ownerFullName}}
                </:cell>
              </PixTableColumn>
            {{/if}}

            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.campaigns-list.table.column.created-on"}}
              </:header>
              <:cell>
                {{formatDate campaign.createdAt}}
              </:cell>
            </PixTableColumn>

            <PixTableColumn @context={{context}} @type="number">
              <:header>
                {{t "pages.campaigns-list.table.column.participants"}}
              </:header>
              <:cell>
                {{campaign.participationsCount}}
              </:cell>
            </PixTableColumn>

            <PixTableColumn @context={{context}} @type="number">
              <:header>
                {{t "pages.campaigns-list.table.column.results"}}
              </:header>
              <:cell>
                {{campaign.sharedParticipationsCount}}
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>

        {{#if this.displayEmptyResult}}
          <p class="table__empty content-text">
            {{t "pages.campaigns-list.table.empty"}}
          </p>
        {{/if}}

        {{#if someSelected}}
          <ActionBar
            @destinationId={{actionBarId}}
            @count={{selectedCampaigns.length}}
            @openDeletionModal={{this.toggleDeletionModal}}
          />

          <DeletionModal
            @showModal={{this.showDeletionModal}}
            @onCloseModal={{this.toggleDeletionModal}}
            @count={{selectedCampaigns.length}}
            @deleteCampaigns={{fn (fn withFunction this.deleteCampaigns reset) selectedCampaigns}}
          />
        {{/if}}
        <PixPaginationControl
          @destinationId={{paginationId}}
          @onChange={{reset}}
          @pagination={{@campaigns.meta}}
          @locale={{this.locale.currentLanguage}}
        />
        <Filters
          @destinationId={{filtersId}}
          @reset={{reset}}
          @ownerNameFilter={{@ownerNameFilter}}
          @nameFilter={{@nameFilter}}
          @statusFilter={{@statusFilter}}
          @onFilter={{@onFilter}}
          @onClearFilters={{@onClear}}
          @numResults={{@campaigns.meta.rowCount}}
          @hideCampaignOwnerFilter={{@hideCampaignOwnerFilter}}
        />
      </SelectableList>
      <div id={{paginationId}} />
      <div id={{actionBarId}} />
    {{/let}}
  </template>
}

const Filters = <template>
  <InElement @destinationId={{@destinationId}}>
    <CampaignFilters
      @ownerNameFilter={{@ownerNameFilter}}
      @nameFilter={{@nameFilter}}
      @statusFilter={{@statusFilter}}
      @onFilter={{fn withFunction @onFilter @reset}}
      @onClearFilters={{fn withFunction @onClearFilters @reset}}
      @numResults={{@numResults}}
      @canDelete={{this.canDelete}}
      @listOnlyCampaignsOfCurrentUser={{@hideCampaignOwnerFilter}}
    />
  </InElement>
</template>;

const PixPaginationControl = <template>
  <InElement @destinationId={{@destinationId}} @waitForElement={{true}}>
    <PixPagination @pagination={{@pagination}} @onChange={{@onChange}} @locale={{@locale}} />
  </InElement>
</template>;

const ActionBar = <template>
  <InElement @destinationId={{@destinationId}}>
    <UiActionBar>
      <:information>
        {{t "pages.campaigns-list.action-bar.information" count=@count}}
      </:information>
      <:actions>
        <PixButton @triggerAction={{@openDeletionModal}} type="button" @variant="error">
          {{t "pages.campaigns-list.action-bar.delete-button"}}
        </PixButton>
      </:actions>
    </UiActionBar>
  </InElement>
</template>;

const DeletionModal = <template>
  <UiDeletionModal
    @title={{t "pages.campaigns-list.deletion-modal.title" count=@count htmlSafe=true}}
    @showModal={{@showModal}}
    @count={{@count}}
    @onTriggerAction={{@deleteCampaigns}}
    @onCloseModal={{@onCloseModal}}
  >
    <:content>
      <p>{{t "pages.campaigns-list.deletion-modal.content.header" count=@count}}</p>
      <p>{{t "pages.campaigns-list.deletion-modal.content.main-participation-prevent" count=@count}}</p>
      <p><strong>{{t "pages.campaigns-list.deletion-modal.content.footer" count=@count}}</strong></p>
    </:content>
  </UiDeletionModal>
</template>;
