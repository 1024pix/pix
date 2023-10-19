import { service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';

export default class ListItems extends Component {
  @service currentUser;
  @tracked selectedStudent = null;
  @tracked isShowingEditStudentNumberModal = false;
  @tracked isLoadingGroups;

  constructor() {
    super(...arguments);

    this.isLoadingGroups = true;
    this.currentUser.organization.groups.then(() => {
      this.isLoadingGroups = false;
    });
  }

  get showCheckbox() {
    const isFeatureEnabled = ENV.APP.FT_DELETE_PARTICIPANT;

    return isFeatureEnabled && this.currentUser.isAdminInOrganization;
  }

  get headerId() {
    return guidFor(this) + 'header';
  }

  get paginationId() {
    return guidFor(this) + 'pagination';
  }

  get filtersId() {
    return guidFor(this) + 'filters';
  }

  get hasStudents() {
    return Boolean(this.args.students.length);
  }

  get groups() {
    const groups = this.currentUser.organization.groups;
    return groups.map(({ name }) => {
      return {
        label: name,
        value: name,
      };
    });
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
  async addResetOnFunction(wrappedFunction, resetParticipants, ...args) {
    await wrappedFunction(...args);
    resetParticipants();
  }

  @action
  addStopPropagationOnFunction(toggleParticipant, event) {
    event.stopPropagation();
    toggleParticipant();
  }
}
