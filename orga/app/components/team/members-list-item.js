import { service } from '@ember/service';
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
  @tracked isRemoveMembershipModalDisplayed = false;
  @tracked isLeaveOrganizationModalDisplayed = false;

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
  setRoleSelection(value) {
    this.args.membership.organizationRole = value;
  }

  @action
  toggleEditionMode() {
    this.isEditionMode = true;
  }

  @action
  async updateRoleOfMember(membership) {
    this.isEditionMode = false;

    membership.organization = this.currentUser.organization;

    try {
      await membership.save();
      this.notifications.sendSuccess(this.intl.t('pages.team-members.notifications.change-member-role.success'));
    } catch (e) {
      membership.rollbackAttributes();
      this.notifications.sendError(this.intl.t('pages.team-members.notifications.change-member-role.error'));
    }
  }

  @action
  cancelUpdateRoleOfMember() {
    this.isEditionMode = false;
    this.args.membership.rollbackAttributes();
  }

  @action
  displayRemoveMembershipModal() {
    this.isRemoveMembershipModalDisplayed = true;
  }

  @action
  displayLeaveOrganizationModal() {
    this.isLeaveOrganizationModalDisplayed = true;
  }

  @action
  closeRemoveMembershipModal() {
    this.isRemoveMembershipModalDisplayed = false;
  }

  @action
  closeLeaveOrganizationModal() {
    this.isLeaveOrganizationModalDisplayed = false;
  }

  @action
  async onRemoveButtonClicked() {
    try {
      const membership = this.args.membership;
      const memberFirstName = membership.user.get('firstName');
      const memberLastName = membership.user.get('lastName');

      await this.args.onRemoveMember(membership);
      this.notifications.sendSuccess(
        this.intl.t('pages.team-members.notifications.remove-membership.success', { memberFirstName, memberLastName }),
      );
    } catch (e) {
      this.notifications.sendError(this.intl.t('pages.team-members.notifications.remove-membership.error'));
    } finally {
      this.closeRemoveMembershipModal();
    }
  }
}
