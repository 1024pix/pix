import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { array, fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { or } from 'ember-truth-helpers';

import ParticipationStatus from '../../ui/participation-status';
import ParticipationFilters from '../filter/participation-filters';
import DeleteParticipationModal from './delete-participation-modal';

export default class ParticipantsList extends Component {
  @service notifications;
  @service currentUser;
  @service store;
  @service locale;

  @tracked isModalOpen = false;
  @tracked participationToDelete;

  get canDeleteParticipation() {
    return this.currentUser.isAdminInOrganization || this.args.campaign.ownerId == this.currentUser.prescriber?.id;
  }

  @action
  openModal(participation, event) {
    event.stopPropagation();
    this.isModalOpen = true;
    this.participationToDelete = participation;
  }

  @action
  closeModal() {
    this.participationToDelete = null;
    this.isModalOpen = false;
  }

  @action
  deleteCampaignParticipation() {
    this.isModalOpen = false;
    this.args.deleteCampaignParticipation(this.args.campaign.id, this.participationToDelete);
    this.participationToDelete = null;
  }

  <template>
    <ParticipationFilters
      @campaign={{@campaign}}
      @selectedDivisions={{@selectedDivisions}}
      @selectedStatus={{@selectedStatus}}
      @selectedGroups={{@selectedGroups}}
      @searchFilter={{@searchFilter}}
      @rowCount={{@rowCount}}
      @isHiddenStages={{true}}
      @isHiddenBadges={{true}}
      @isHiddenCertificability={{true}}
      @onFilter={{@onFilter}}
      @onResetFilter={{@onResetFilter}}
    />

    <PixTable
      @variant="orga"
      @caption={{t "pages.campaign-activity.table.title"}}
      @data={{@participations}}
      class="table"
      @onRowClick={{@onClickParticipant}}
    >
      <:columns as |participation context|>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.campaign-activity.table.column.last-name"}}
          </:header>
          <:cell>
            <LinkTo
              @route={{if
                (or @campaign.isTypeAssessment @campaign.isTypeExam)
                "authenticated.campaigns.participant-assessment"
                "authenticated.campaigns.participant-profile"
              }}
              @models={{array @campaign.id participation.lastCampaignParticipationId}}
            >
              <span
                aria-label={{t
                  "pages.campaign-activity.table.see-results"
                  firstName=participation.firstName
                  lastName=participation.lastName
                }}
              >
                {{participation.lastName}}</span>
            </LinkTo>
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.campaign-activity.table.column.first-name"}}
          </:header>
          <:cell>
            {{participation.firstName}}
          </:cell>
        </PixTableColumn>

        {{#if @campaign.externalIdLabel}}
          <PixTableColumn @context={{context}}>
            <:header>
              {{@campaign.externalIdLabel}}
            </:header>
            <:cell>
              {{participation.participantExternalId}}
            </:cell>
          </PixTableColumn>
        {{/if}}

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.campaign-activity.table.column.status"}}
          </:header>
          <:cell>
            <ParticipationStatus @status={{participation.status}} />
          </:cell>
        </PixTableColumn>

        {{#if @showParticipationCount}}
          <PixTableColumn @context={{context}} @type="number">
            <:header>
              {{t "pages.campaign-activity.table.column.participationCount"}}
            </:header>
            <:cell>
              {{participation.participationCount}}
            </:cell>
          </PixTableColumn>
        {{/if}}

        {{#if this.canDeleteParticipation}}
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.campaign-activity.table.column.delete"}}
            </:header>
            <:cell>
              <PixIconButton
                @ariaLabel={{t "pages.campaign-activity.table.delete-button-label"}}
                @iconName="delete"
                @triggerAction={{fn this.openModal participation}}
                @size="small"
                class="campaign-activity-table-actions__button campaign-activity-table-actions__button--delete"
              />
            </:cell>
          </PixTableColumn>
        {{/if}}

      </:columns>
    </PixTable>

    {{#unless @participations}}
      <p class="table__empty content-text">{{t "pages.campaign-activity.table.empty"}}</p>
    {{/unless}}

    {{#if @participations}}
      <PixPagination @pagination={{@participations.meta}} @locale={{this.locale.currentLanguage}} />
    {{/if}}

    <DeleteParticipationModal
      @participation={{this.participationToDelete}}
      @campaign={{@campaign}}
      @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
      @closeModal={{this.closeModal}}
      @isModalOpen={{this.isModalOpen}}
    />
  </template>
}
