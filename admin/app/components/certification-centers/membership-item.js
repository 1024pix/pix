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
    this.args.onCertificationCenterMembershipRoleChange(this.args.certificationCenterMembership);
  }

  @action
  cancelMembershipRoleEditing() {
    const changedAttributes = this.args.certificationCenterMembership.changedAttributes();
    // hack to fix EmberData behaviour in integration testing
    const certificationCenterMembershipAttributesHaveChanged = changedAttributes.length && !!changedAttributes[0];
    const shouldRollbackCertificationCenterMembershipAttributes =
      this.args.certificationCenterMembership.hasDirtyAttributes && certificationCenterMembershipAttributesHaveChanged;

    if (shouldRollbackCertificationCenterMembershipAttributes) {
      this.args.certificationCenterMembership.rollbackAttributes();
    }

    this.isEditionMode = false;
  }

  @action
  onRoleSelected(role) {
    this.args.certificationCenterMembership.role = role;
  }
}
