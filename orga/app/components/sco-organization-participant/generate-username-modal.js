import Component from '@glimmer/component';

export default class GenerateUsernameModal extends Component {
  get canGenerateSomeUsernames() {
    return this.args.totalAffectedStudents > 0;
  }
}
