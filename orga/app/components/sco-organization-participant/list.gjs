import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import { fn, uniqueId } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, not } from 'ember-truth-helpers';
import ENV from 'pix-orga/config/environment';

import { CONNECTION_TYPES } from '../../helpers/connection-types';
import ImportInformationBanner from '../import-information-banner';
import InElement from '../in-element';
import SelectableList from '../selectable-list';
import EditParticipantNameModal from '../ui/edit-participant-name-modal';
import EmptyState from '../ui/empty-state';
import GenerateUsernamePasswordModal from './generate-username-password-modal';
import ListActionBar from './list-action-bar';
import ManageAuthenticationMethodModal from './manage-authentication-method-modal';
import ResetPasswordModal from './reset-password-modal';
import ScoLearnerFilters from './sco-learner-filters';
import TableRow from './table-row';

async function withFunction(wrappedFunction, func, ...args) {
  func(...args);
  await wrappedFunction(...args);
}

function stopPropagation(event) {
  event.stopPropagation();
}

export default class ScoList extends Component {
  @service currentUser;
  @service notifications;
  @service intl;
  @service locale;
  @service store;
  @service session;
  @service fileSaver;

  @tracked isLoadingDivisions;
  @tracked student = null;
  @tracked isShowingAuthenticationMethodModal = false;
  @tracked showResetPasswordModal = false;
  @tracked showGenerateUsernamePasswordModal = false;
  @tracked showEditNameModal = false;
  @tracked selectedStudentForNameModification = null;
  @tracked divisions;

  @tracked affectedStudents = [];

  constructor() {
    super(...arguments);

    this.isLoadingDivisions = true;
    this.currentUser.organization.divisions.then((divisions) => {
      this.isLoadingDivisions = false;
      this.divisions = divisions.map(({ name }) => ({
        label: name,
        value: name,
      }));
    });
  }

  get connectionTypes() {
    return CONNECTION_TYPES;
  }

  get connectionTypesOptions() {
    return [
      { value: 'none', label: this.intl.t(CONNECTION_TYPES.none) },
      { value: 'email', label: this.intl.t(CONNECTION_TYPES.email) },
      { value: 'identifiant', label: this.intl.t(CONNECTION_TYPES.identifiant) },
      { value: 'mediacentre', label: this.intl.t(CONNECTION_TYPES.mediacentre) },
      { value: 'without_mediacentre', label: this.intl.t(CONNECTION_TYPES.without_mediacentre) },
    ];
  }

  get showCheckbox() {
    return this.currentUser?.organization.type === 'SCO' && this.currentUser?.organization.isManagingStudents;
  }

  get hasStudents() {
    return Boolean(this.args.students.length);
  }

  get hasGarIdentityProvider() {
    return this.currentUser.organization.hasGarIdentityProvider;
  }

  @action
  openAuthenticationMethodModal(student, event) {
    event.stopPropagation();
    this.student = student;
    this.isShowingAuthenticationMethodModal = true;
  }

  @action
  closeAuthenticationMethodModal() {
    this.isShowingAuthenticationMethodModal = false;
  }

  @action
  openResetPasswordModal(students, event) {
    event.stopPropagation();
    this.affectedStudents = students.filter((student) => student.authenticationMethods.includes('identifiant'));
    this.showResetPasswordModal = true;
  }

  @action
  closeResetPasswordModal() {
    this.showResetPasswordModal = false;
  }

  @action
  openGenerateUsernamePasswordModal(students) {
    event.stopPropagation();
    this.affectedStudents = students.filter((student) => student.isAssociated);
    this.showGenerateUsernamePasswordModal = true;
  }

  @action
  closeGenerateUsernamePasswordModal() {
    this.showGenerateUsernamePasswordModal = false;
  }

  @action
  openEditNameModal(student, event) {
    event.stopPropagation();
    this.selectedStudentForNameModification = student;
    this.showEditNameModal = true;
  }

  @action
  closeEditNameModal() {
    this.showEditNameModal = false;
  }

  @action
  async generateUsernamePasswordForStudents(affectedStudents, resetSelectedStudents) {
    const affectedStudentsIds = affectedStudents.map((affectedStudents) => affectedStudents.id);
    try {
      await this.store.adapterFor('sco-organization-participant').generateOrganizationLearnersUsernamePassword({
        fileSaver: this.fileSaver,
        organizationId: this.currentUser.organization.id,
        organizationLearnersIds: affectedStudentsIds,
        token: this.session?.data?.authenticated?.access_token,
      });
      this.closeResetPasswordModal();
      resetSelectedStudents();
      this.notifications.sendSuccess(
        this.intl.t('pages.sco-organization-participants.messages.password-reset-success'),
      );
      await this.args.refreshValues();
    } catch (fetchErrors) {
      const error = Array.isArray(fetchErrors) && fetchErrors.length > 0 && fetchErrors[0];
      let errorMessage;
      switch (error?.code) {
        case 'USER_DOES_NOT_BELONG_TO_ORGANIZATION':
          errorMessage = this.intl.t(
            'api-error-messages.student-password-reset.user-does-not-belong-to-organization-error',
          );
          break;
        case 'ORGANIZATION_LEARNER_DOES_NOT_BELONG_TO_ORGANIZATION':
          errorMessage = this.intl.t(
            'api-error-messages.student-password-reset.organization-learner-does-not-belong-to-organization-error',
          );
          break;
        case 'ORGANIZATION_LEARNER_WITHOUT_USERNAME':
          errorMessage = this.intl.t(
            'api-error-messages.student-password-reset.organization-learner-without-username-error',
          );
          break;
        default:
          errorMessage = this.intl.t(this._getI18nKeyByStatus(error.status));
      }
      this.notifications.sendError(errorMessage);
    }
  }

  _getI18nKeyByStatus(status) {
    switch (status) {
      case 400:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 401:
        return ENV.APP.API_ERROR_MESSAGES.LOGIN_UNAUTHORIZED.I18N_KEY;
      case 422:
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      case 504:
        return ENV.APP.API_ERROR_MESSAGES.GATEWAY_TIMEOUT.I18N_KEY;
      default:
        return ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
    }
  }

  <template>
    <ImportInformationBanner @importDetail={{@importDetail}} />

    {{#let (uniqueId) (uniqueId) (uniqueId) (uniqueId) as |actionBarId paginationId headerId filtersId|}}
      <div id={{filtersId}} />
      <SelectableList
        @items={{@students}}
        as |toggleStudent isStudentSelected allSelected someSelected toggleAll selectedStudents reset|
      >
        <PixTable
          @condensed={{true}}
          @variant="orga"
          @caption={{t "pages.sco-organization-participants.table.description"}}
          @data={{@students}}
          class="table"
          @onRowClick={{@onClickLearner}}
        >
          <:columns as |student context index|>
            <TableRow
              @showCheckbox={{this.showCheckbox}}
              @lastnameSort={{@lastnameSort}}
              @onSortByLastname={{@sortByLastname}}
              @participationCountOrder={{@participationCountOrder}}
              @onSortByParticipationCount={{@sortByParticipationCount}}
              @divisionSort={{@divisionSort}}
              @onSortByDivision={{@sortByDivision}}
              @allSelected={{allSelected}}
              @someSelected={{someSelected}}
              @onToggleAll={{toggleAll}}
              @hasStudents={{this.hasStudents}}
              @hasComputeOrganizationLearnerCertificabilityEnabled={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
              @index={{index}}
              @context={{context}}
              @student={{student}}
              @isStudentSelected={{isStudentSelected student}}
              @openAuthenticationMethodModal={{this.openAuthenticationMethodModal}}
              @openEditNameModal={{this.openEditNameModal}}
              @canEditLearnerName={{this.currentUser.canEditLearnerName}}
              @onToggleStudent={{fn withFunction (fn toggleStudent student) stopPropagation}}
              @hideCertifiableDate={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
            />
          </:columns>
        </PixTable>

        {{#if (eq @students.meta.participantCount 0)}}
          <EmptyState
            @infoText={{t "pages.sco-organization-participants.no-participants"}}
            @actionText={{t "pages.sco-organization-participants.no-participants-action"}}
          />
        {{else if (not @students)}}
          <div class="table__empty content-text">
            {{t "pages.sco-organization-participants.table.empty"}}
          </div>
        {{/if}}

        {{#if someSelected}}
          <ActionBar
            @destinationId={{actionBarId}}
            @count={{selectedStudents.length}}
            @openGenerateUsernamePasswordModal={{fn this.openGenerateUsernamePasswordModal selectedStudents}}
            @openResetPasswordModal={{fn this.openResetPasswordModal selectedStudents}}
            @hasGarIdentityProvider={{this.hasGarIdentityProvider}}
            @totalSelectedStudents={{selectedStudents.length}}
            @totalAffectedStudents={{this.affectedStudents.length}}
            @onTriggerAction={{fn this.generateUsernamePasswordForStudents this.affectedStudents reset}}
            @showResetPasswordModal={{this.showResetPasswordModal}}
            @onCloseResetPassworModal={{this.closeResetPasswordModal}}
            @showGeneratePasswordModal={{this.showGenerateUsernamePasswordModal}}
            @onCloseGeneratePasswordModal={{this.closeGenerateUsernamePasswordModal}}
          />
        {{/if}}

        <PixPaginationControl
          @destinationId={{paginationId}}
          @onChange={{reset}}
          @pagination={{@students.meta}}
          @locale={{this.locale.currentLocale}}
        />

        <Filters
          @destinationId={{filtersId}}
          @studentsCount={{@students.meta.rowCount}}
          @onFilter={{fn withFunction @onFilter reset}}
          @searchFilter={{@searchFilter}}
          @certificabilityFilter={{@certificabilityFilter}}
          @connectionTypeFilter={{@connectionTypeFilter}}
          @divisionsFilter={{@divisionsFilter}}
          @onResetFilter={{fn withFunction @onResetFilter reset}}
          @divisionsOptions={{this.divisions}}
          @isLoadingDivisions={{this.isLoadingDivisions}}
          @connectionTypesOptions={{this.connectionTypesOptions}}
        />
      </SelectableList>

      <div id={{actionBarId}} />
      <div id={{paginationId}} />

      <ManageAuthenticationMethodModal
        @organizationId={{this.currentUser.organization.id}}
        @student={{this.student}}
        @display={{this.isShowingAuthenticationMethodModal}}
        @onClose={{this.closeAuthenticationMethodModal}}
      />

      <EditParticipantNameModal
        @participant={{this.selectedStudentForNameModification}}
        @show={{this.showEditNameModal}}
        @onClose={{this.closeEditNameModal}}
      />
    {{/let}}
  </template>
}

const Filters = <template>
  <InElement @destinationId={{@destinationId}}>
    <ScoLearnerFilters
      @studentsCount={{@studentsCount}}
      @onFilter={{@onFilter}}
      @searchFilter={{@searchFilter}}
      @certificabilityFilter={{@certificabilityFilter}}
      @connectionTypeFilter={{@connectionTypeFilter}}
      @divisionsFilter={{@divisionsFilter}}
      @onResetFilter={{@onResetFilter}}
      @divisionsOptions={{@divisionsOptions}}
      @isLoadingDivisions={{@isLoadingDivisions}}
      @connectionTypesOptions={{@connectionTypesOptions}}
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
    <ListActionBar
      @count={{@count}}
      @openGenerateUsernamePasswordModal={{@openGenerateUsernamePasswordModal}}
      @openResetPasswordModal={{@openResetPasswordModal}}
      @hasGarIdentityProvider={{@hasGarIdentityProvider}}
    />
    <ResetPasswordModal
      @showModal={{@showResetPasswordModal}}
      @totalSelectedStudents={{@totalSelectedStudents}}
      @totalAffectedStudents={{@totalAffectedStudents}}
      @onTriggerAction={{@onTriggerAction}}
      @onCloseModal={{@onCloseResetPasswordModal}}
    />
    <GenerateUsernamePasswordModal
      @showModal={{@showGeneratePasswordModal}}
      @totalAffectedStudents={{@totalAffectedStudents}}
      @onTriggerAction={{@onTriggerAction}}
      @onCloseModal={{@onCloseGeneratePasswordModal}}
    />
  </InElement>
</template>;
