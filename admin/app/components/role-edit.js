import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class RoleEdit extends Component {

  options = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'MEMBER', label: 'Membre' }
  ];

  @tracked selectedRole;

  constructor() {
    super(...arguments);
    this._updateSelectedRole();
  }

  @action
  changeRole(role) {
    this.args.record.organizationRole = role.value;
    this._updateSelectedRole();
  }

  _updateSelectedRole() {
    this.selectedRole = this.options.find((opt) => opt.value === this.args.record.organizationRole);
  }
}
