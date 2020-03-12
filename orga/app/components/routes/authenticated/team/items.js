import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { action } from '@ember/object';

const adminOption = { value: 'ADMIN', label: 'Administrateur', disabled: false };

const memberOption = { value: 'MEMBER', label: 'Membre', disabled: false };

export default class Items extends Component {

  @service currentUser;

  organizationRoles = null;
  isEditionMode = false;
  selectedNewRole = null;
  currentRole = null;

  constructor() {
    super(...arguments);
    this.organizationRoles = [adminOption, memberOption];
  }

  @action
  setRoleSelection(selected) {
    this.set('selectedNewRole', selected);
    this.set('isEditionMode', true);
  }

  @action
  editRoleOfMember(membership) {
    this.set('selectedNewRole', null);
    this.set('currentRole', membership.displayRole);
    this.set('isEditionMode', true);

  }

  @action
  updateRoleOfMember(membership) {
    this.set('isEditionMode', false);

    if (null === this.get('selectedNewRole')) return false;

    membership.set('displayRole', this.get('selectedNewRole.label'));
    membership.set('organizationRole', this.get('selectedNewRole.value'));

    return membership.save();
  }

  @action
  cancelUpdateRoleOfMember() {
    this.set('isEditionMode', false);
    this._clearState();
  }

  _clearState() {
    this.set('selectedNewRole', null);
    this.set('currentRole', null);
  }
}
