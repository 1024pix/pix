import Component from '@glimmer/component';

export default class ResetPasswordModal extends Component {
  get canResetPasswords() {
    return this.args.totalAffectedStudents > 0;
  }
}
