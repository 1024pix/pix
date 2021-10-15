import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ListItems extends Component {
  @service currentUser;
  @tracked selectedStudent = null;
  @tracked isShowingEditStudentNumberModal = false;

  loadGroups = async () => {
    const groups = await this.currentUser.organization.groups;
    return groups.map(({ name }) => {
      return {
        label: name,
        value: name,
      };
    });
  };

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
  onFilter(fieldName, debounced, e) {
    this.args.onFilter(fieldName, debounced, e.target.value);
  }

  @action
  onFilterGroup(fieldName, debounced, value) {
    this.args.onFilter(fieldName, debounced, value);
  }

  @action
  openEditStudentNumberModal(student) {
    this.selectedStudent = student;
    this.isShowingEditStudentNumberModal = true;
  }

  @action
  closeEditStudentNumberModal() {
    this.selectedStudent = null;
    this.isShowingEditStudentNumberModal = false;
  }
}
