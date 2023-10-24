import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import some from 'lodash/some';

import { tracked } from '@glimmer/tracking';

export default class AddStudentList extends Component {
  @service notifications;
  @service store;
  @service router;

  emptyMessage = 'Aucune classe trouvée';

  @tracked selectedDivisions = this.args.selectedDivisions;

  get isDisabled() {
    const areStudentsAllEnrolled = this.args.studentList.every((student) => student.isEnrolled);
    return !!areStudentsAllEnrolled;
  }

  get hasCheckState() {
    return this._hasCheckedSomething();
  }

  get hasPartialState() {
    return !this._hasCheckedEverything() && this._hasCheckedSomething();
  }

  get shouldEnableAddButton() {
    const hasAtLeastOneSelectedStudent = this.store.peekAll('student').some((student) => student.isSelected);
    return hasAtLeastOneSelectedStudent;
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
  toggleAllItems(parentCheckbox) {
    let newState = true;
    if (this._hasCheckedEverything()) {
      newState = false;
    }
    this.args.studentList.forEach((student) => student.setSelected(newState));
    parentCheckbox.srcElement.checked = newState;
  }

  @action
  async enrolStudents() {
    const sessionId = this.args.session.id;
    const studentListToAdd = this.store.peekAll('student').filter((student) => student.isSelected);

    try {
      await this.args.session.save({ adapterOptions: { studentListToAdd, sessionId } });
      this.args.returnToSessionCandidates(sessionId);
      this.notifications.success('Le(s) candidat(s) ont été inscrit(s) avec succès.');
    } catch (error) {
      let errorMessage = 'Une erreur est survenue au moment d‘inscrire les candidats...';
      if (error.errors?.[0]?.status === '422') errorMessage = error.errors?.[0]?.detail;
      this.notifications.error(errorMessage);
    }
  }

  @action
  async selectDivision(divisions) {
    this.selectedDivisions = divisions;
    return this.router.replaceWith({ queryParams: { divisions } });
  }

  get _enrolableStudentList() {
    return this.args.studentList.filter(({ isEnrolled }) => !isEnrolled);
  }

  _hasCheckedEverything() {
    return this._enrolableStudentList.every(({ isSelected }) => isSelected);
  }

  _hasCheckedSomething() {
    const hasOneOrMoreCheck = this.args.studentList.some((student) => student.isSelected);
    return hasOneOrMoreCheck;
  }
}
