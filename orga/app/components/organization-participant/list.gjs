import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn, uniqueId } from '@ember/helper';
import { on } from '@ember/modifier';
import { action, get } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjs from 'dayjs';
import { t } from 'ember-intl';
import { eq, not } from 'ember-truth-helpers';

import { getColumnName } from '../../helpers/import-format.js';
import CertificabilityCell from '../certificability/cell';
import Tooltip from '../certificability/tooltip';
import DropdownIconTrigger from '../dropdown/icon-trigger';
import DropdownItem from '../dropdown/item';
import InElement from '../in-element';
import SelectableList from '../selectable-list';
import UiActionBar from '../ui/action-bar';
import UiDeletionModal from '../ui/deletion-modal';
import EditParticipantNameModal from '../ui/edit-participant-name-modal';
import LastParticipationDateTooltip from '../ui/last-participation-date-tooltip';
import LearnerFilters from './learner-filters';

async function withFunction(wrappedFunction, func, ...args) {
  func(...args);
  await wrappedFunction(...args);
}

function stopPropagation(event) {
  event.stopPropagation();
}

export default class List extends Component {
  @tracked showDeletionModal = false;
  @tracked showEditNameModal = false;
  @tracked selectedParticipantForNameModification = null;

  @service currentUser;
  @service intl;
  @service locale;

  displayDate(date) {
    return dayjs(date).format('DD/MM/YYYY');
  }

  @action
  getExtraColumnRowValue(extraColumnName, participant) {
    const extraColumnValue = participant.extraColumns[extraColumnName];

    if (extraColumnName === 'ORALIZATION') {
      return this.intl.t(`pages.organization-participants.table.row-value.oralization.${extraColumnValue}`);
    }
    if (!extraColumnValue) return '';

    if (dayjs(extraColumnValue).isValid()) {
      return this.displayDate(extraColumnValue);
    }

    return extraColumnValue;
  }

  get isAdminInOrganization() {
    return !!this.currentUser.isAdminInOrganization;
  }

  get showCheckbox() {
    return this.isAdminInOrganization && !this.currentUser.hasLearnerImportFeature;
  }

  get hasParticipants() {
    return Boolean(this.args.participants.length);
  }

  get customColumns() {
    if (!this.currentUser.hasLearnerImportFeature || !this.args.participants.meta) return [];

    return this.args.participants.meta.headingCustomColumns;
  }

  get customFilters() {
    if (!this.currentUser.hasLearnerImportFeature || !this.args.participants.meta) return [];

    return this.args.participants.meta.customFilters;
  }

  get hasActionColumn() {
    return Boolean(this.actionsForParticipant().length);
  }

  get extraColumnRowInfo() {
    if (!this.args.participant.extraColumns) {
      return [];
    }

    return Object.keys(this.args.participant.extraColumns).map((extraColumnName) =>
      this.getExtraColumnRowValue(extraColumnName, this.args.participant),
    );
  }

  get onClickLearner() {
    if (this.currentUser.canAccessMissionsPage) return undefined;

    return this.args.onClickLearner;
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
  openEditNameModal(participant, event) {
    event.stopPropagation();
    this.selectedParticipantForNameModification = participant;
    this.showEditNameModal = true;
  }

  @action
  closeEditNameModal() {
    this.showEditNameModal = false;
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
  actionsForParticipant(participant) {
    const actions = [];

    if (this.currentUser.canActivateOralizationLearner) {
      const oralizationActivated = participant.extraColumns['ORALIZATION'];
      actions.push([
        {
          label: oralizationActivated
            ? this.intl.t('pages.organization-participants.table.actions.disable-oralization')
            : this.intl.t('pages.organization-participants.table.actions.enable-oralization'),
          onClick: () =>
            this.args.toggleOralizationFeatureForParticipant(
              participant.id,
              this.currentUser.organization.id,
              !oralizationActivated,
            ),
        },
      ]);
    }

    if (this.currentUser.canEditLearnerName) {
      actions.push({
        label: this.intl.t('components.ui.edit-participant-name-modal.label'),
        onClick: this.openEditNameModal,
      });
    }

    return actions;
  }

  <template>
    {{#let (uniqueId) (uniqueId) (uniqueId) (uniqueId) as |actionBarId paginationId headerId filtersId|}}
      <div id={{filtersId}} />
      <SelectableList
        @items={{@participants}}
        as |toggleParticipant isParticipantSelected allSelected someSelected toggleAll selectedParticipants reset|
      >
        <PixTable
          @condensed={{true}}
          @variant="orga"
          @caption={{t "pages.organization-participants.table.description"}}
          @data={{@participants}}
          class="table"
          @onRowClick={{this.onClickLearner}}
        >
          <:columns as |participant context|>
            {{#if this.showCheckbox}}
              <PixTableColumn @context={{context}}>
                <:header>
                  <PixCheckbox
                    @screenReaderOnly={{true}}
                    @checked={{someSelected}}
                    @isIndeterminate={{not allSelected}}
                    disabled={{not @participants.length}}
                    {{on "click" toggleAll}}
                  >
                    <:label>{{t "pages.organization-participants.table.column.mainCheckbox"}}</:label>
                  </PixCheckbox>
                </:header>
                <:cell>
                  <span {{on "click" (fn withFunction (fn toggleParticipant participant) stopPropagation)}}>
                    <PixCheckbox
                      @screenReaderOnly={{true}}
                      {{on "click" (fn withFunction (fn toggleParticipant participant) stopPropagation)}}
                      @checked={{isParticipantSelected participant}}
                    >
                      <:label>
                        {{t
                          "pages.organization-participants.table.column.checkbox"
                          firstname=participant.firstName
                          lastname=participant.lastName
                        }}
                      </:label>
                    </PixCheckbox>
                  </span>
                </:cell>
              </PixTableColumn>
            {{/if}}

            <PixTableColumn
              @context={{context}}
              @onSort={{fn this.addResetOnFunction @sortByLastname reset}}
              @sortOrder={{@lastnameSort}}
              @ariaLabelDefaultSort={{t "pages.organization-participants.table.column.last-name.ariaLabelDefaultSort"}}
              @ariaLabelSortAsc={{t "pages.organization-participants.table.column.last-name.ariaLabelSortUp"}}
              @ariaLabelSortDesc={{t "pages.organization-participants.table.column.last-name.ariaLabelSortDown"}}
            >
              <:header>
                {{t "pages.organization-participants.table.column.last-name.label"}}
              </:header>
              <:cell>
                {{#if @hasOrganizationParticipantPage}}
                  <LinkTo
                    @route="authenticated.organization-participants.organization-participant"
                    @model={{participant.id}}
                  >
                    {{participant.lastName}}
                  </LinkTo>
                {{else}}
                  {{participant.lastName}}
                {{/if}}
              </:cell>
            </PixTableColumn>

            <PixTableColumn @context={{context}}>
              <:header>
                {{t "pages.organization-participants.table.column.first-name"}}
              </:header>
              <:cell>
                {{participant.firstName}}
              </:cell>
            </PixTableColumn>

            {{#each this.customColumns as |heading|}}
              <PixTableColumn @context={{context}}>
                <:header>
                  <div class="organization-participant__align-element">
                    {{t (getColumnName heading)}}
                    {{#if (eq heading "ORALIZATION")}}
                      <PixTooltip @id="organization-participants-oralization-tooltip" @isWide="true">
                        <:triggerElement>
                          <PixIcon
                            @name="help"
                            @plainIcon="true"
                            aria-label={{t
                              "pages.organization-participants.table.oralization-header-tooltip-aria-label"
                            }}
                            aria-describedby="organization-participants-oralization-tooltip"
                          />
                        </:triggerElement>

                        <:tooltip>
                          {{t "pages.organization-participants.table.oralization-header-tooltip"}}
                        </:tooltip>
                      </PixTooltip>
                    {{/if}}
                  </div>
                </:header>
                <:cell>
                  {{this.getExtraColumnRowValue heading participant}}
                </:cell>
              </PixTableColumn>
            {{/each}}

            {{#unless this.currentUser.canAccessMissionsPage}}
              <PixTableColumn
                @context={{context}}
                @type="number"
                @onSort={{fn this.addResetOnFunction @sortByParticipationCount reset}}
                @sortOrder={{@participationCountOrder}}
                @ariaLabelDefaultSort={{t
                  "pages.organization-participants.table.column.participation-count.ariaLabelDefaultSort"
                }}
                @ariaLabelSortAsc={{t
                  "pages.organization-participants.table.column.participation-count.ariaLabelSortUp"
                }}
                @ariaLabelSortDesc={{t
                  "pages.organization-participants.table.column.participation-count.ariaLabelSortDown"
                }}
              >
                <:header>
                  {{t "pages.organization-participants.table.column.participation-count.label"}}
                </:header>
                <:cell>
                  {{participant.participationCount}}
                </:cell>
              </PixTableColumn>

              <PixTableColumn
                @context={{context}}
                @onSort={{fn this.addResetOnFunction @sortByLatestParticipation reset}}
                @sortOrder={{@latestParticipationOrder}}
                @ariaLabelDefaultSort={{t
                  "pages.organization-participants.table.column.latest-participation.ariaLabelDefaultSort"
                }}
                @ariaLabelSortAsc={{t
                  "pages.organization-participants.table.column.latest-participation.ariaLabelSortUp"
                }}
                @ariaLabelSortDesc={{t
                  "pages.organization-participants.table.column.latest-participation.ariaLabelSortDown"
                }}
              >
                <:header>
                  {{t "pages.organization-participants.table.column.latest-participation.label"}}
                </:header>
                <:cell>
                  {{#if participant.lastParticipationDate}}
                    <div class="organization-participant__align-element">
                      <span>{{this.displayDate participant.lastParticipationDate}}</span>
                      <LastParticipationDateTooltip
                        @id={{participant.id}}
                        @campaignName={{participant.campaignName}}
                        @campaignType={{participant.campaignType}}
                        @participationStatus={{participant.participationStatus}}
                      />
                    </div>
                  {{/if}}
                </:cell>
              </PixTableColumn>

              <PixTableColumn @context={{context}}>
                <:header>
                  <div class="organization-participant__align-element">
                    {{t "pages.organization-participants.table.column.is-certifiable.label"}}
                    <Tooltip
                      @hasComputeOrganizationLearnerCertificabilityEnabled={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
                    />
                  </div>
                </:header>
                <:cell>
                  <div class="organization-participant__align-element organization-participant__align-element--column">
                    <CertificabilityCell
                      @certifiableAt={{participant.certifiableAt}}
                      @isCertifiable={{participant.isCertifiable}}
                      @hideCertifiableDate={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
                    />
                  </div>
                </:cell>
              </PixTableColumn>
            {{/unless}}

            {{#if this.hasActionColumn}}
              <PixTableColumn @context={{context}}>
                <:header>
                  {{t "common.actions.global"}}
                </:header>
                <:cell>
                  <DropdownIconTrigger
                    @icon="moreVert"
                    @dropdownButtonClass="organization-participant__dropdown-button"
                    @dropdownContentClass="organization-participant__dropdown-content"
                    @ariaLabel={{t "pages.sup-organization-participants.actions.show-actions"}}
                  >
                    <:default as |closeMenu|>
                      {{#each (this.actionsForParticipant participant) as |actionForPartipant|}}
                        <DropdownItem @onClick={{fn actionForPartipant.onClick participant}} @closeMenu={{closeMenu}}>
                          {{actionForPartipant.label}}
                        </DropdownItem>
                      {{/each}}
                    </:default>
                  </DropdownIconTrigger>
                </:cell>
              </PixTableColumn>
            {{/if}}
          </:columns>
        </PixTable>

        <Filters
          @destinationId={{filtersId}}
          @learnersCount={{@participants.meta.rowCount}}
          @fullName={{@fullName}}
          @customFilters={{this.customFilters}}
          @customFiltersValues={{@customFiltersValues}}
          @certificabilityFilter={{@certificabilityFilter}}
          @onTriggerFiltering={{fn this.addResetOnFunction @triggerFiltering reset}}
          @onResetFilter={{fn this.addResetOnFunction @onResetFilter reset}}
        />

        {{#if someSelected}}
          <ActionBar
            @destinationId={{actionBarId}}
            @count={{selectedParticipants.length}}
            @openDeletionModal={{this.openDeletionModal}}
          />

          <DeletionModal
            @selectedParticipants={{selectedParticipants}}
            @showDeletionModal={{this.showDeletionModal}}
            @onTriggerAction={{fn this.deleteParticipants selectedParticipants reset}}
            @onCloseDeletionModal={{this.closeDeletionModal}}
          />
        {{/if}}

        {{#if this.showEditNameModal}}
          <EditParticipantNameModal
            @participant={{this.selectedParticipantForNameModification}}
            @show={{this.showEditNameModal}}
            @onClose={{this.closeEditNameModal}}
          />
        {{/if}}
        <PixPaginationControl
          @destinationId={{paginationId}}
          @onChange={{reset}}
          @pagination={{@participants.meta}}
          @locale={{this.locale.currentLocale}}
        />
      </SelectableList>

      {{#unless @participants}}
        <div class="table__empty content-text">
          {{t "pages.organization-participants.table.empty"}}
        </div>
      {{/unless}}

      <div id={{paginationId}} />
      <div id={{actionBarId}} />
    {{/let}}
  </template>
}

const Filters = <template>
  <InElement @destinationId={{@destinationId}}>
    <LearnerFilters
      @learnersCount={{@learnersCount}}
      @fullName={{@fullName}}
      @customFilters={{@customFilters}}
      @customFiltersValues={{@customFiltersValues}}
      @certificabilityFilter={{@certificabilityFilter}}
      @onTriggerFiltering={{@onTriggerFiltering}}
      @onResetFilter={{@onResetFilter}}
    />
  </InElement>
</template>;

const ActionBar = <template>
  <InElement @destinationId={{@destinationId}}>
    <UiActionBar>
      <:information>
        {{t "pages.organization-participants.action-bar.information" count=@count}}
      </:information>
      <:actions>

        <PixButton @triggerAction={{@openDeletionModal}} type="button" @variant="error">
          {{t "pages.organization-participants.action-bar.delete-button"}}
        </PixButton>
      </:actions>
    </UiActionBar>
  </InElement>
</template>;

const PixPaginationControl = <template>
  <InElement @destinationId={{@destinationId}} @waitForElement={{true}}>
    <PixPagination @pagination={{@pagination}} @onChange={{@onChange}} @locale={{@locale}} />
  </InElement>
</template>;

const DeletionModal = <template>
  <UiDeletionModal
    @title={{t
      "pages.organization-participants.deletion-modal.title"
      count=@selectedParticipants.length
      firstname=(get @selectedParticipants "0.firstName")
      lastname=(get @selectedParticipants "0.lastName")
      htmlSafe=true
    }}
    @showModal={{@showDeletionModal}}
    @count={{@selectedParticipants.length}}
    @onTriggerAction={{@onTriggerAction}}
    @onCloseModal={{@onCloseDeletionModal}}
  >
    <:content>
      <p>{{t "pages.organization-participants.deletion-modal.content.header" count=@selectedParticipants.length}}</p>
      <p>{{t
          "pages.organization-participants.deletion-modal.content.main-participation-prevent"
          count=@selectedParticipants.length
        }}</p>
      <p>{{t
          "pages.organization-participants.deletion-modal.content.main-campaign-prevent"
          count=@selectedParticipants.length
        }}</p>
      <p><strong>{{t
            "pages.organization-participants.deletion-modal.content.footer"
            count=@selectedParticipants.length
          }}</strong></p>
    </:content>
  </UiDeletionModal>
</template>;
