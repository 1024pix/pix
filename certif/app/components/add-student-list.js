import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AddStudentList extends Component {

  @service notifications;

  get headerCheckboxStatus() {
    return this.hasCheckedEverything
      ? 'checked'
      : this.hasCheckedSomething ? 'partial' : 'unchecked';
  }

  get hasCheckedSomething() {
    const hasOneOrMoreCheck = this.args.studentList.any((student) => student.isSelected);
    return hasOneOrMoreCheck;
  }

  get hasCheckedEverything() {
    const allCertifReportsAreCheck = this.args.studentList.every((student) => student.isSelected);
    return allCertifReportsAreCheck;
  }

  get numberOfStudentsAlreadyCandidate() {
    return this.args.certificationCandidates ? this.args.certificationCandidates.length : 0;
  }

  get showStickyBar() {
    const thereIsAlreadySomeCandidates = this.numberOfStudentsAlreadyCandidate > 0;
    return this.hasCheckedSomething || thereIsAlreadySomeCandidates;
  }

  get studentsSelectedInformation() {
    const countStudents = (count, student) => student.isSelected ? count + 1 : count;
    const numberOfStudentsSelected = this.args.studentList.reduce(countStudents, 0);
    return numberOfStudentsSelected > 0
      ? `${numberOfStudentsSelected} candidat(s) sélectionné(s)`
      : 'Aucun candidat sélectionné';
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
    this.args.studentList.forEach((student) => {
      student.isSelected = newState;
    });
  }

  @action
  async enrollStudents() {
    const sessionId = this.args.session.id;
    const studentListToAdd = this.args.studentList.filter((student) => student.isSelected);
    try {
      await this.args.session.save({ adapterOptions: { studentListToAdd, sessionId } });
      this.args.returnToSessionCandidates(sessionId);
    } catch (error) {
      this.notifications.error('Une erreur est survenue au moment d‘enregistrer les candidats... ');
    }
  }
}
