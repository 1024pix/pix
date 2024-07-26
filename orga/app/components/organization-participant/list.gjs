import { fn } from '@ember/helper';
import { action, get } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import InElement from '../in-element';
import SelectableList from '../selectable-list';
import PaginationControl from '../table/pagination-control';
import DeletionModal from '../ui/deletion-modal';
import ActionBar from './action-bar';
import LearnerFilters from './learner-filters';
import TableHeaders from './table-headers';
import TableRow from './table-row';

export default class List extends Component {
  @tracked showDeletionModal = false;

  @service currentUser;

  get showCheckbox() {
    return this.currentUser.isAdminInOrganization && !this.currentUser.hasLearnerImportFeature;
  }

  get headerId() {
    return guidFor(this) + 'mainCheckbox';
  }

  get actionBarId() {
    return guidFor(this) + 'actionBar';
  }

  get paginationId() {
    return guidFor(this) + 'pagination';
  }

  get filtersId() {
    return guidFor(this) + 'filters';
  }

  get hasParticipants() {
    return Boolean(this.args.participants.length);
  }

  get customColumns() {
    if (!this.currentUser.hasLearnerImportFeature || !this.args.participants.meta) return [];

    return this.args.participants.meta.headingCustomColumns;
  }

  @action
  openDeletionModal() {
    this.showDeletionModal = true;
  }

  @action
  closeDeletionModal() {
    this.showDeletionModal = false;
  }

  @action
  async deleteParticipants(selectedParticipants, resetParticipants) {
    await this.args.deleteParticipants(selectedParticipants);
    this.closeDeletionModal();
    resetParticipants();
  }

  @action
  async addResetOnFunction(wrappedFunction, resetParticipants, ...args) {
    await wrappedFunction(...args);
    resetParticipants();
  }

  @action
  addStopPropagationOnFunction(toggleParticipant, event) {
    event.stopPropagation();
    toggleParticipant();
  }

  <template>
    <div id={{this.filtersId}} />

    <div class="panel">
      <table class="table content-text content-text--small">
        <caption class="screen-reader-only">{{t "pages.organization-participants.table.description"}}</caption>
        <thead id={{this.headerId}} />

        <tbody>
          <SelectableList @items={{@participants}}>
            <:manager as |allSelected someSelected toggleAll selectedParticipants reset|>
              <InElement @destinationId={{this.headerId}}>
                <TableHeaders
                  @allSelected={{allSelected}}
                  @someSelected={{someSelected}}
                  @showCheckbox={{this.showCheckbox}}
                  @hasParticipants={{this.hasParticipants}}
                  @onToggleAll={{toggleAll}}
                  @lastnameSort={{@lastnameSort}}
                  @customHeadings={{this.customColumns}}
                  @participationCountOrder={{@participationCountOrder}}
                  @latestParticipationOrder={{@latestParticipationOrder}}
                  @onSortByLastname={{fn this.addResetOnFunction @sortByLastname reset}}
                  @onSortByParticipationCount={{fn this.addResetOnFunction @sortByParticipationCount reset}}
                  @onSortByLatestParticipation={{fn this.addResetOnFunction @sortByLatestParticipation reset}}
                  @hasComputeOrganizationLearnerCertificabilityEnabled={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
                />
              </InElement>
              {{#if someSelected}}
                <InElement @destinationId={{this.actionBarId}}>
                  <ActionBar @count={{selectedParticipants.length}} @openDeletionModal={{this.openDeletionModal}} />
                  <DeletionModal
                    @title={{t
                      "pages.organization-participants.deletion-modal.title"
                      count=selectedParticipants.length
                      firstname=(get selectedParticipants "0.firstName")
                      lastname=(get selectedParticipants "0.lastName")
                      htmlSafe=true
                    }}
                    @showModal={{this.showDeletionModal}}
                    @count={{selectedParticipants.length}}
                    @onTriggerAction={{fn this.deleteParticipants selectedParticipants reset}}
                    @onCloseModal={{this.closeDeletionModal}}
                  >
                    <:content>
                      <p>{{t "pages.organization-participants.deletion-modal.content.header" count=this.count}}</p>
                      <p>{{t
                          "pages.organization-participants.deletion-modal.content.main-participation-prevent"
                          count=selectedParticipants.length
                        }}</p>
                      <p>{{t
                          "pages.organization-participants.deletion-modal.content.main-campaign-prevent"
                          count=selectedParticipants.length
                        }}</p>
                      <p>{{t
                          "pages.organization-participants.deletion-modal.content.main-participation-access"
                          count=selectedParticipants.length
                        }}</p>
                      <p>{{t
                          "pages.organization-participants.deletion-modal.content.main-new-campaign-access"
                          count=selectedParticipants.length
                        }}</p>
                      <p><strong>{{t
                            "pages.organization-participants.deletion-modal.content.footer"
                            count=selectedParticipants.length
                          }}</strong></p>
                    </:content>
                  </DeletionModal>
                </InElement>
              {{/if}}
              <InElement @destinationId={{this.paginationId}} @waitForElement={{true}}>
                <PaginationControl @pagination={{@participants.meta}} @onChange={{reset}} />
              </InElement>
              <InElement @destinationId={{this.filtersId}}>
                <LearnerFilters
                  @learnersCount={{@participants.meta.rowCount}}
                  @fullName={{@fullName}}
                  @certificabilityFilter={{@certificabilityFilter}}
                  @onTriggerFiltering={{fn this.addResetOnFunction @triggerFiltering reset}}
                  @onResetFilter={{fn this.addResetOnFunction @onResetFilter reset}}
                />
              </InElement>
            </:manager>
            <:item as |participant toggleParticipant isParticipantSelected|>
              <TableRow
                @showCheckbox={{this.showCheckbox}}
                @participant={{participant}}
                @isParticipantSelected={{isParticipantSelected}}
                @onToggleParticipant={{fn this.addStopPropagationOnFunction toggleParticipant}}
                @onClickLearner={{fn @onClickLearner participant.id}}
                @customRows={{this.customColumns}}
                @hideCertifiableDate={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
              />
            </:item>
          </SelectableList>
        </tbody>
      </table>

      {{#unless @participants}}
        <div class="table__empty content-text">
          {{t "pages.organization-participants.table.empty"}}
        </div>
      {{/unless}}
    </div>

    <div id={{this.actionBarId}} />
    <div id={{this.paginationId}} />
  </template>
}
