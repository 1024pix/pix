import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

const options = [
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'MEMBER', label: 'Membre' }
];

export default class MemberItem extends Component {

  @tracked organizationRoles = null;
  @tracked isEditionMode = false;
  @tracked selectedNewRole = null;
  @tracked currentRole = null;

  constructor() {
    super(...arguments);
    this.organizationRoles = options;
  }

  @action
  setRoleSelection(selected) {
    this.selectedNewRole = selected;
    this.isEditionMode = true;
  }

  @action
  updateRoleOfMember(membership) {
    this.isEditionMode = false;
    if (!this.selectedNewRole) return false;

    membership.displayRole = this.selectedNewRole.label;
    membership.organizationRole = this.selectedNewRole.value;

    return membership.save();
  }

  @action
  cancelUpdateRoleOfMember() {
    this.isEditionMode = false;
    this.selectedNewRole = null;
    this.currentRole = null;
  }

  @action
  editRoleOfMember(membership) {
    this.selectedNewRole = null;
    this.currentRole = membership.displayedOrganizationRole;
    this.isEditionMode = true;
  }
}
