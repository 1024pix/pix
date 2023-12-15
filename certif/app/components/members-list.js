import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MembersList extends Component {
  @service currentUser;
  @service featureToggles;
  @service intl;
  @service notifications;
  @service session;

  @tracked
  isLeaveCertificationCenterModalOpen = false;

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
  closeLeaveCertificationCenterModal() {
    this.isLeaveCertificationCenterModalOpen = false;
  }

  @action
  async leaveCertificationCenter() {
    try {
      await this.args.onLeaveCertificationCenter();
      this.notifications.success(
        this.intl.t('pages.team.members.notifications.leave-certification-center.success', {
          certificationCenterName: this.currentUser.currentAllowedCertificationCenterAccess.name,
        }),
      );
      this.session.invalidate();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      this.notifications.error(this.intl.t('pages.team.members.notifications.leave-certification-center.error'));
    } finally {
      this.closeLeaveCertificationCenterModal();
    }
  }
}
