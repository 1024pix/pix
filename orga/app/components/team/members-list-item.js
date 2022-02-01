import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

const ARIA_LABEL_MEMBER_TRANSLATION = 'pages.team-members.actions.select-role.options.member';
const ARIA_LABEL_ADMIN_TRANSLATION = 'pages.team-members.actions.select-role.options.admin';

export default class MembersListItem extends Component {
  @service currentUser;
  @service notifications;
  @service intl;

  @tracked organizationRoles = null;
  @tracked isEditionMode = false;
  @tracked selectedNewRole = null;
  @tracked currentRole = null;
  @tracked isRemoveMembershipModalDisplayed = false;

  adminOption = {
    value: 'ADMIN',
    label: this.intl.t(ARIA_LABEL_ADMIN_TRANSLATION),
    disabled: false,
  };

  memberOption = {
    value: 'MEMBER',
    label: this.intl.t(ARIA_LABEL_MEMBER_TRANSLATION),
    disabled: false,
  };

  displayRoleByOrganizationRole = {
    ADMIN: this.intl.t(ARIA_LABEL_ADMIN_TRANSLATION),
    MEMBER: this.intl.t(ARIA_LABEL_MEMBER_TRANSLATION),
  };

  constructor() {
    super(...arguments);
    this.organizationRoles = [this.adminOption, this.memberOption];
  }

  get displayRole() {
    return this.displayRoleByOrganizationRole[this.args.membership.organizationRole];
  }

  get isNotCurrentUserMembership() {
    return this.currentUser.prescriber.id !== this.args.membership.user.get('id');
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

    try {
      await membership.save();
      this.notifications.success(this.intl.t('pages.team-members.notifications.change-member-role.success'));
    } catch (e) {
      this.notifications.error(this.intl.t('pages.team-members.notifications.change-member-role.error'));
    }
  }

  @action
  cancelUpdateRoleOfMember() {
    this.isEditionMode = false;
    this._clearState();
  }

  @action
  displayRemoveMembershipModal() {
    this.isRemoveMembershipModalDisplayed = true;
  }

  @action
  closeRemoveMembershipModal() {
    this.isRemoveMembershipModalDisplayed = false;
  }

  @action
  async onRemoveButtonClicked() {
    try {
      const membership = this.args.membership;
      const memberFirstName = membership.user.get('firstName');
      const memberLastName = membership.user.get('lastName');

      await this.args.onRemoveMember(membership);
      this.notifications.success(
        this.intl.t('pages.team-members.notifications.remove-membership.success', { memberFirstName, memberLastName })
      );
    } catch (e) {
      this.notifications.error(this.intl.t('pages.team-members.notifications.remove-membership.error'));
    } finally {
      this.closeRemoveMembershipModal();
    }
  }

  _clearState() {
    this.selectedNewRole = null;
    this.currentRole = null;
  }
}
