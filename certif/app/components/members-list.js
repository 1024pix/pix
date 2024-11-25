import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class MembersList extends Component {
  @service currentUser;
  @service intl;
  @service pixToast;
  @service session;

  @tracked isLeaveCertificationCenterModalOpen = false;
  @tracked isRemoveMemberModalOpen = false;
  @tracked removingMember;

  get shouldDisplayRefererColumn() {
    return this.args.hasCleaHabilitation;
  }

  get shouldDisplayManagingColumn() {
    return this.currentUser.isAdminOfCurrentCertificationCenter;
  }

  get isMultipleAdminsAvailable() {
    const adminMembers = this.args.members?.filter((member) => member.isAdmin);
    return adminMembers.length > 1;
  }

  @action
  openLeaveCertificationCenterModal() {
    this.isLeaveCertificationCenterModalOpen = true;
  }

  @action
  openRemoveMemberModal(member) {
    this.removingMember = member;
    this.isRemoveMemberModalOpen = true;
  }

  @action
  closeLeaveCertificationCenterModal() {
    this.isLeaveCertificationCenterModalOpen = false;
  }

  @action
  closeRemoveMemberModal() {
    this.isRemoveMemberModalOpen = false;
    this.removingMember = undefined;
  }

  @action
  async leaveCertificationCenter() {
    try {
      await this.args.onLeaveCertificationCenter();
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.team.members.notifications.leave-certification-center.success', {
          certificationCenterName: this.currentUser.currentAllowedCertificationCenterAccess.name,
        }),
      });
      await this.session.waitBeforeInvalidation(5000);
      this.session.invalidate();
    } catch (error) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.team.members.notifications.leave-certification-center.error'),
      });
    } finally {
      this.closeLeaveCertificationCenterModal();
    }
  }

  @action
  async removeMember() {
    try {
      await this.args.onRemoveMember(this.removingMember);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.team.members.notifications.remove-membership.success', {
          memberFirstName: this.removingMember.firstName,
          memberLastName: this.removingMember.lastName,
        }),
      });
    } catch (e) {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.team.members.notifications.remove-membership.error'),
      });
    } finally {
      this.closeRemoveMemberModal();
    }
  }
}
