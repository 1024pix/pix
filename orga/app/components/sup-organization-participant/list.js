import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ListItems extends Component {
  @service currentUser;
  @tracked selectedStudent = null;
  @tracked showDeletionModal = false;
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
    return this.currentUser.isAdminInOrganization;
  }

  get headerId() {
    return guidFor(this) + 'header';
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
