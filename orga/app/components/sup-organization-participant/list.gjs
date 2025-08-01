import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import { fn, get, uniqueId } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, not } from 'ember-truth-helpers';

import ImportInformationBanner from '../import-information-banner';
import InElement from '../in-element';
import SelectableList from '../selectable-list';
import DeletionModal from '../ui/deletion-modal';
import EditParticipantNameModal from '../ui/edit-participant-name-modal';
import EmptyState from '../ui/empty-state';
import ActionBar from './action-bar';
import EditStudentNumberModal from './modal/edit-student-number-modal';
import SupLearnerFilters from './sup-learner-filters';
import TableRow from './table-row';

export default class ListItems extends Component {
  @service currentUser;
  @service locale;
  @tracked selectedStudent = null;
  @tracked showDeletionModal = false;
  @tracked isShowingEditStudentNumberModal = false;
  @tracked showEditNameModal = false;
  @tracked isLoadingGroups;

  constructor() {
    super(...arguments);

    this.isLoadingGroups = true;
    this.currentUser.organization.groups.then((groups) => {
      this.isLoadingGroups = false;
      this.groups = groups.map(({ name }) => {
        return {
          label: name,
          value: name,
        };
      });
    });
  }

  get showCheckbox() {
    return this.currentUser.isAdminInOrganization;
  }

  get hasStudents() {
    return Boolean(this.args.students.length);
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
  async deleteStudents(selectedStudents, resetStudents) {
    await this.args.deleteStudents(selectedStudents);
    this.closeDeletionModal();
    resetStudents();
  }

  @action
  async onSaveStudentNumber(newStudentNumber) {
    await this.selectedStudent.save({
      adapterOptions: {
        updateStudentNumber: true,
        organizationId: this.currentUser.organization.id,
        studentNumber: newStudentNumber,
      },
    });
    this.selectedStudent.studentNumber = newStudentNumber;
  }

  @action
  openEditStudentNumberModal(student, event) {
    event.stopPropagation();
    this.selectedStudent = student;
    this.isShowingEditStudentNumberModal = true;
  }

  @action
  closeEditStudentNumberModal() {
    this.selectedStudent = null;
    this.isShowingEditStudentNumberModal = false;
  }

  @action
  openEditNameModal(student, event) {
    event.stopPropagation();
    this.selectedStudent = student;
    this.showEditNameModal = true;
  }

  @action
  closeEditNameModal() {
    this.showEditNameModal = false;
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
          @caption={{t "pages.sup-organization-participants.table.description"}}
          @data={{@students}}
          class="table"
          @onRowClick={{@onClickLearner}}
        >
          <:columns as |student context|>
            <TableRow
              @showCheckbox={{this.showCheckbox}}
              @student={{student}}
              @context={{context}}
              @isStudentSelected={{isStudentSelected student}}
              @openEditStudentNumberModal={{this.openEditStudentNumberModal}}
              @openEditNameModal={{this.openEditNameModal}}
              @canEditLearnerName={{this.currentUser.canEditLearnerName}}
              @isAdminInOrganization={{this.currentUser.isAdminInOrganization}}
              @onToggleStudent={{fn this.addStopPropagationOnFunction (fn toggleStudent student)}}
              @hideCertifiableDate={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
              @allSelected={{allSelected}}
              @someSelected={{someSelected}}
              @lastnameSort={{@lastnameSort}}
              @hasStudents={{this.hasStudents}}
              @participationCountOrder={{@participationCountOrder}}
              @onToggleAll={{toggleAll}}
              @sortByLastname={{fn this.addResetOnFunction @sortByLastname reset}}
              @sortByParticipationCount={{fn this.addResetOnFunction @sortByParticipationCount reset}}
              @hasComputeOrganizationLearnerCertificabilityEnabled={{@hasComputeOrganizationLearnerCertificabilityEnabled}}
            />
          </:columns>
        </PixTable>

        {{#if (eq @students.meta.participantCount 0)}}
          <EmptyState
            @infoText={{t "pages.sup-organization-participants.empty-state.no-participants"}}
            @actionText={{t "pages.sup-organization-participants.empty-state.no-participants-action"}}
          />
        {{else if (not @students)}}
          <div class="table__empty content-text">
            {{t "pages.sup-organization-participants.table.empty"}}
          </div>
        {{/if}}

        {{#if someSelected}}
          <SupActionBar
            @destinationId={{actionBarId}}
            @count={{selectedStudents.length}}
            @selectedStudents={{selectedStudents}}
            @openDeletionModal={{this.openDeletionModal}}
            @showDeletionModal={{this.showDeletionModal}}
            @onTriggerAction={{fn this.deleteStudents selectedStudents reset}}
            @closeDeletionModal={{this.closeDeletionModal}}
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
          @onFilter={{fn this.addResetOnFunction @onFilter reset}}
          @searchFilter={{@searchFilter}}
          @studentNumberFilter={{@studentNumberFilter}}
          @certificabilityFilter={{@certificabilityFilter}}
          @groupsFilter={{@groupsFilter}}
          @onResetFilter={{fn this.addResetOnFunction @onResetFilter reset}}
          @groupsOptions={{this.groups}}
          @isLoadingGroups={{this.isLoadingGroups}}
        />

      </SelectableList>
      <div id={{actionBarId}} />
      <div id={{paginationId}} />

      <EditStudentNumberModal
        @student={{this.selectedStudent}}
        @display={{this.isShowingEditStudentNumberModal}}
        @onClose={{this.closeEditStudentNumberModal}}
        @onSubmit={{this.onSaveStudentNumber}}
      />
    {{/let}}

    <EditParticipantNameModal
      @participant={{this.selectedStudent}}
      @show={{this.showEditNameModal}}
      @onClose={{this.closeEditNameModal}}
    />
  </template>
}

const Filters = <template>
  <InElement @destinationId={{@destinationId}}>
    <SupLearnerFilters
      @studentsCount={{@studentsCount}}
      @onFilter={{@onFilter}}
      @searchFilter={{@searchFilter}}
      @studentNumberFilter={{@studentNumberFilter}}
      @certificabilityFilter={{@certificabilityFilter}}
      @groupsFilter={{@groupsFilter}}
      @onResetFilter={{@onResetFilter}}
      @groupsOptions={{@groupsOptions}}
      @isLoadingGroups={{@isLoadingGroups}}
    />
  </InElement>
</template>;

const PixPaginationControl = <template>
  <InElement @destinationId={{@destinationId}} @waitForElement={{true}}>
    <PixPagination @pagination={{@pagination}} @onChange={{@onChange}} @locale={{@locale}} />
  </InElement>
</template>;

const SupActionBar = <template>
  <InElement @destinationId={{@destinationId}}>
    <ActionBar @count={{@count}} @openDeletionModal={{@openDeletionModal}} />
    <DeletionModal
      @title={{t
        "pages.sup-organization-participants.deletion-modal.title"
        count=@count
        firstname=(get @selectedStudents "0.firstName")
        lastname=(get @selectedStudents "0.lastName")
        htmlSafe=true
      }}
      @showModal={{@showDeletionModal}}
      @count={{@count}}
      @onTriggerAction={{@onTriggerAction}}
      @onCloseModal={{@closeDeletionModal}}
    >
      <:content>
        <p>{{t "pages.sup-organization-participants.deletion-modal.content.header" count=@count}}</p>
        <p>{{t
            "pages.sup-organization-participants.deletion-modal.content.main-participation-prevent"
            count=@count
          }}</p>
        <p>{{t "pages.sup-organization-participants.deletion-modal.content.main-campaign-prevent" count=@count}}</p>
        <p><strong>{{t "pages.sup-organization-participants.deletion-modal.content.footer" count=@count}}</strong></p>
      </:content>
    </DeletionModal>
  </InElement>
</template>;
