import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const adminOption = { value: 'ADMIN', label: 'Administrateur', disabled: false };

const memberOption = { value: 'MEMBER', label: 'Membre', disabled: false };

export default class Items extends Component {

  @service currentUser;

  @tracked organizationRoles = null;
  @tracked isEditionMode = false;
  @tracked selectedNewRole = null;
  @tracked currentRole = null;

  constructor() {
    super(...arguments);
    this.organizationRoles = [adminOption, memberOption];
  }

  @action
  setRoleSelection(event) {
    this.selectedNewRole = event.target.value;
    this.isEditionMode = true;
  }

  @action
  editRoleOfMember(membership) {
    this.selectedNewRole = null;
    this.currentRole = membership.displayRole;
    this.isEditionMode = true;
  }

  @action
  async updateRoleOfMember(membership) {
    this.isEditionMode = false;

    if (!this.selectedNewRole) return false;

    membership.organizationRole = this.selectedNewRole;

    membership.organization = this.currentUser.organization;

    return membership.save();
  }

  @action
  cancelUpdateRoleOfMember() {
    this.isEditionMode = false;
    this._clearState();
  }

  _clearState() {
    this.selectedNewRole = null;
    this.currentRole = null;
  }
}
