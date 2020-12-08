import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import some from 'lodash/some';

export default class AddStudentList extends Component {

  @service notifications;
  @service store;

  title = 'Classes'
  emptyMessage = 'Aucune classe trouvée'

  get headerCheckboxStatus() {
    return this.hasCheckedEverything
      ? 'checked'
      : this.hasCheckedSomething ? 'partial' : 'unchecked';
  }

  get hasCheckedSomething() {
    const hasOneOrMoreCheck = this.args.studentList.any((student) => student.isSelected);
    return hasOneOrMoreCheck;
  }

  get shouldEnableAddButton() {
    const hasAtLeastOneSelectedStudent = this.store.peekAll('student').any((student) => student.isSelected);
    return hasAtLeastOneSelectedStudent;
  }

  get hasCheckedEverything() {
    const enrollableStudentList = this.args.studentList.filter((student) => !student.isEnrolled);
    const allCertifReportsAreCheck = enrollableStudentList.every((student) => student.isSelected);
    return allCertifReportsAreCheck;
  }

  get numberOfStudentsAlreadyCandidate() {
    return this.args.numberOfEnrolledStudents;
  }

  get showStickyBar() {
    const students = this.store.peekAll('student');
    const areStudentsEnrolledOrSelected = students.map((s) => s.isEnrolled || s.isSelected);
    return some(areStudentsEnrolledOrSelected);
  }

  get numberOfStudentsSelected() {
    const students = this.store.peekAll('student');
    const selectedStudents = students.filter((student) => student.isSelected);
    return selectedStudents.length;
  }

  @action
  toggleItem(item) {
    item.isSelected = !item.isSelected;
  }

  @action
  toggleAllItems() {
    const state = this.headerCheckboxStatus;
    let newState = true;
    if (state === 'checked') {
      newState = false;
    }
    this.args.studentList
      .forEach((student) => student.setSelected(newState));
  }

  @action
  async enrollStudents() {
    const sessionId = this.args.session.id;
    const studentListToAdd = this.store.peekAll('student').filter((student) => student.isSelected);

    try {
      await this.args.session.save({ adapterOptions: { studentListToAdd, sessionId } });
      this.args.returnToSessionCandidates(sessionId);
      this.notifications.success('Le(s) candidat(s) ont été ajouté(s) avec succès.');
    } catch (error) {
      this.notifications.error('Une erreur est survenue au moment d‘enregistrer les candidats... ');
    }
  }

  @action
  selectDivision() {
  }
}
