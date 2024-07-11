import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { fn, uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { eq, not } from 'ember-truth-helpers';

import InElement from '../in-element';
import SelectableList from '../selectable-list';
import TableHeader from '../table/header';
import TablePaginationControl from '../table/pagination-control';
import UiActionBar from '../ui/action-bar';
import UiDeletionModal from '../ui/deletion-modal';
import CampaignType from './detail/type';
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
  @service store;
  @service notifications;
  @tracked showDeletionModal = false;

  get canDelete() {
    return this.args.canDelete ?? false;
  }

  get labels() {
    return {
      ASSESSMENT: 'components.campaign.type.explanation.ASSESSMENT',
      PROFILES_COLLECTION: 'components.campaign.type.explanation.PROFILES_COLLECTION',
    };
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
      this.notifications.sendSuccess(
        this.intl.t('pages.campaigns-list.action-bar.success-message', {
          count: selectedCampaigns.length,
        }),
      );
      this.args.onDeleteCampaigns();
    } catch {
      this.notifications.sendError(
        this.intl.t('pages.campaigns-list.action-bar.error-message', {
          count: selectedCampaigns.length,
        }),
      );
    }
  }

  <template>
    {{#let (uniqueId) (uniqueId) (uniqueId) (uniqueId) as |actionBarId paginationId headerId filtersId|}}
      <section class="campaign-list">
        <div id={{filtersId}} />

        <div class="panel">
          <table class="table content-text content-text--small">
            <caption class="screen-reader-only">{{@caption}}</caption>
            <thead id={{headerId}} />

            <tbody>
              <SelectableList @items={{@campaigns}}>
                <:manager as |allSelected someSelected toggleAll selectedCampaigns reset|>
                  <InElement @destinationId={{filtersId}}>
                    <CampaignFilters
                      @ownerNameFilter={{@ownerNameFilter}}
                      @nameFilter={{@nameFilter}}
                      @statusFilter={{@statusFilter}}
                      @onFilter={{fn withFunction @onFilter reset}}
                      @onClearFilters={{fn withFunction @onClear reset}}
                      @numResults={{@campaigns.meta.rowCount}}
                      @canDelete={{this.canDelete}}
                    />
                  </InElement>
                  <Headers @destinationId={{headerId}} @showCampaignOwner={{@showCampaignOwner}}>
                    {{#if this.canDelete}}
                      <TableHeader @size="small">
                        <PixCheckbox
                          @screenReaderOnly={{true}}
                          @checked={{someSelected}}
                          @isIndeterminate={{not allSelected}}
                          disabled={{not @campaigns.length}}
                          {{on "click" toggleAll}}
                        ><:label>{{t "pages.campaigns-list.table.column.mainCheckbox"}}</:label></PixCheckbox>
                      </TableHeader>
                    {{/if}}
                  </Headers>
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
                  <PaginationControl
                    @destinationId={{paginationId}}
                    @onChange={{reset}}
                    @pagination={{@campaigns.meta}}
                  />
                </:manager>
                <:item as |campaign toggleCampaign isCampaignSelected|>
                  <Row
                    @campaign={{campaign}}
                    @showCampaignOwner={{@showCampaignOwner}}
                    @labels={{this.labels}}
                    @onClickCampaign={{@onClickCampaign}}
                  >
                    {{#if this.canDelete}}
                      <td {{on "click" (fn withFunction toggleCampaign stopPropagation)}}>
                        <PixCheckbox
                          {{on "click" (fn withFunction toggleCampaign stopPropagation)}}
                          @checked={{isCampaignSelected}}
                        />
                      </td>
                    {{/if}}
                  </Row>
                </:item>
              </SelectableList>
            </tbody>
          </table>
          {{#if (eq @campaigns.length 0)}}
            <p class="table__empty content-text">
              {{t "pages.campaigns-list.table.empty"}}
            </p>
          {{/if}}
        </div>

        <div id={{paginationId}} />
      </section>
      <div id={{actionBarId}} />
    {{/let}}
  </template>
}

const PaginationControl = <template>
  <InElement @destinationId={{@destinationId}} @waitForElement={{true}}>
    <TablePaginationControl @pagination={{@pagination}} @onChange={{@onChange}} />
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

const Headers = <template>
  <InElement @destinationId={{@destinationId}}>
    <tr>
      {{yield}}
      <TableHeader @size="wide">{{t "pages.campaigns-list.table.column.name"}}</TableHeader>
      <TableHeader @size="medium">{{t "pages.campaigns-list.table.column.code"}}</TableHeader>
      {{#if @showCampaignOwner}}
        <TableHeader @size="medium" class="hide-on-mobile">{{t
            "pages.campaigns-list.table.column.created-by"
          }}</TableHeader>
      {{/if}}
      <TableHeader @size="medium" class="hide-on-mobile">{{t
          "pages.campaigns-list.table.column.created-on"
        }}</TableHeader>
      <TableHeader @size="medium" class="hide-on-mobile">{{t
          "pages.campaigns-list.table.column.participants"
        }}</TableHeader>
      <TableHeader @size="medium" class="hide-on-mobile">{{t "pages.campaigns-list.table.column.results"}}</TableHeader>
    </tr>
  </InElement>
</template>;

const Row = <template>
  <tr {{on "click" (fn @onClickCampaign @campaign.id)}} class="tr--clickable">
    {{yield}}
    <td>
      <span class="campaign-list__campaign-link-cell">
        <CampaignType @labels={{@labels}} @campaignType={{@campaign.type}} @hideLabel={{true}} />
        <LinkTo @route="authenticated.campaigns.campaign" @model={{@campaign.id}}>
          {{@campaign.name}}
        </LinkTo>
      </span>
    </td>
    <td {{on "click" stopPropagation}}>{{@campaign.code}}</td>
    {{#if @showCampaignOwner}}
      <td class="hide-on-mobile">{{@campaign.ownerFullName}}</td>
    {{/if}}
    <td class="hide-on-mobile">{{dayjsFormat @campaign.createdAt "DD/MM/YYYY" allow-empty=true}}</td>
    <td class="hide-on-mobile">{{@campaign.participationsCount}}</td>
    <td class="hide-on-mobile">{{@campaign.sharedParticipationsCount}}</td>
  </tr>
</template>;
