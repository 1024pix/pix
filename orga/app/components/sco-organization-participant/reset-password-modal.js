import Component from '@glimmer/component';

export default class ResetPasswordModal extends Component {
  get canResetSomePasswords() {
    return this.args.totalAffectedStudents > 0;
  }
}
