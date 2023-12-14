import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class MembersList extends Component {
  @service currentUser;
  @service featureToggles;
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
    await this.args.onLeaveCertificationCenter();
    this.closeLeaveCertificationCenterModal();
    this.session.invalidate();
  }
}
