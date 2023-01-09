import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ListItems extends Component {
  @service currentUser;
  @service intl;
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

  get groups() {
    const groups = this.currentUser.organization.groups;
    return groups.map(({ name }) => {
      return {
        label: name,
        value: name,
      };
    });
  }

  get certificabilityOptions() {
    return [
      {
        value: 'not-available',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.not-available'),
      },
      {
        value: 'eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'),
      },
      {
        value: 'non-eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible'),
      },
    ];
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
}
