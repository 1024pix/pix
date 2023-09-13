import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CertificationCentersMembershipItemComponent extends Component {
  @tracked isEditionMode = false;

  @action
  editMembershipRole() {
    this.isEditionMode = true;
  }

  @action
  saveMembershipRole() {
    this.isEditionMode = false;
  }

  @action
  cancelMembershipRoleEditing() {
    if (this.args.certificationCenterMembership.hasDirtyAttributes) {
      this.args.certificationCenterMembership.rollbackAttributes();
    }

    this.isEditionMode = false;
  }

  @action
  onRoleSelected(role) {
    this.args.certificationCenterMembership.role = role;
  }
}
