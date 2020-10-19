import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class AddStudentList extends Component {

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

  @action
  toggleItem(item) {
    item.isSelected = !item.isSelected;
  }

  @action
  toggleAllItems() {
    const newState = !this.hasCheckedSomething;
    this.args.studentList.forEach((student) => {
      student.isSelected = newState;
    });
  }
}
