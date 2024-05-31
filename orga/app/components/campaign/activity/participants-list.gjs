import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { array, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import TableHeader from '../../table/header';
import PaginationControl from '../../table/pagination-control';
import ParticipationStatus from '../../ui/participation-status';
import ParticipationFilters from '../filter/participation-filters';
import DeleteParticipationModal from './delete-participation-modal';

export default class ParticipantsList extends Component {
  @service notifications;
  @service currentUser;
  @service store;
  @service intl;

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

    <section ...attributes>
      <div class="panel">
        <table class="table content-text content-text--small">
          <colgroup class="table__column">
            <col class="table__column--wide" />
            <col class="table__column--wide" />
            {{#if @campaign.idPixLabel}}
              <col class="table__column--medium" />
            {{/if}}
            <col class="table__column--wide" />
            {{#if @showParticipationCount}}
              <col class="table__column--wide" />
            {{/if}}
            {{#if this.canDeleteParticipation}}
              <col class="table__column--small table__column--right hide-on-mobile" />
            {{/if}}
          </colgroup>
          <thead>
            <tr>
              <TableHeader>{{t "pages.campaign-activity.table.column.last-name"}}</TableHeader>
              <TableHeader>{{t "pages.campaign-activity.table.column.first-name"}}</TableHeader>
              {{#if @campaign.idPixLabel}}
                <TableHeader>{{@campaign.idPixLabel}}</TableHeader>
              {{/if}}
              <TableHeader>{{t "pages.campaign-activity.table.column.status"}}</TableHeader>
              {{#if @showParticipationCount}}
                <TableHeader @size="wide">
                  {{t "pages.campaign-activity.table.column.participationCount"}}
                </TableHeader>
              {{/if}}
              {{#if this.canDeleteParticipation}}
                <TableHeader class="hide-on-mobile">
                  <span class="screen-reader-only">
                    {{t "pages.campaign-activity.table.column.delete"}}
                  </span>
                </TableHeader>
              {{/if}}
            </tr>
          </thead>

          {{#if @participations}}
            <tbody>
              {{#each @participations as |participation|}}
                <tr
                  aria-label={{t "pages.campaign-activity.table.row-title"}}
                  {{on "click" (fn @onClickParticipant @campaign.id participation.lastCampaignParticipationId)}}
                  class="tr--clickable"
                >
                  <td>
                    <LinkTo
                      @route={{if
                        @campaign.isTypeAssessment
                        "authenticated.campaigns.participant-assessment"
                        "authenticated.campaigns.participant-profile"
                      }}
                      @models={{array @campaign.id participation.lastCampaignParticipationId}}
                    >
                      <span
                        aria-label="{{t
                          'pages.campaign-activity.table.see-results'
                          firstName=participation.firstName
                          lastName=participation.lastName
                        }}"
                      >
                        {{participation.lastName}}</span>
                    </LinkTo>
                  </td>
                  <td>{{participation.firstName}}</td>
                  {{#if @campaign.idPixLabel}}
                    <td class="table__column table__column--break-word">{{participation.participantExternalId}}</td>
                  {{/if}}
                  <td>
                    <ParticipationStatus @status={{participation.status}} @campaignType={{@campaign.type}} />
                  </td>
                  {{#if @showParticipationCount}}
                    <td>
                      {{participation.participationCount}}
                    </td>
                  {{/if}}
                  {{#if this.canDeleteParticipation}}
                    <td class="hide-on-mobile">
                      <PixIconButton
                        @ariaLabel={{t "pages.campaign-activity.table.delete-button-label"}}
                        @withBackground={{true}}
                        @icon="trash-can"
                        @triggerAction={{fn this.openModal participation}}
                        @size="small"
                        class="campaign-activity-table-actions__button campaign-activity-table-actions__button--delete"
                      >
                        <FaIcon />
                      </PixIconButton>
                    </td>
                  {{/if}}
                </tr>
              {{/each}}
            </tbody>
          {{/if}}
        </table>

        {{#unless @participations}}
          <p class="table__empty content-text">{{t "pages.campaign-activity.table.empty"}}</p>
        {{/unless}}
      </div>

      {{#if @participations}}
        <PaginationControl @pagination={{@participations.meta}} />
      {{/if}}

      <DeleteParticipationModal
        @participation={{this.participationToDelete}}
        @campaign={{@campaign}}
        @deleteCampaignParticipation={{this.deleteCampaignParticipation}}
        @closeModal={{this.closeModal}}
        @isModalOpen={{this.isModalOpen}}
      />
    </section>
  </template>
}
