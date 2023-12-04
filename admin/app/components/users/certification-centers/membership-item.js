import Component from '@glimmer/component';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UsersCertificationCentersMembershipItemComponent extends Component {
  @service notifications;
  @service store;
  @service intl;

  @tracked isEditionMode = false;

  certificationCenterRoles = [
    { value: 'ADMIN', label: this.intl.t('common.roles.admin') },
    { value: 'MEMBER', label: this.intl.t('common.roles.member') },
  ];

  @action
  editMembershipRole() {
    this.isEditionMode = true;
  }

  @action
  onRoleSelected(role) {
    this.args.certificationCenterMembership.role = role;
  }

  @action
  saveMembershipRole() {
    this.isEditionMode = false;
    this.args.onCertificationCenterMembershipRoleChange(this.args.certificationCenterMembership);
  }

  @action
  cancelMembershipRoleEditing() {
    this.args.certificationCenterMembership.rollbackAttributes();
    this.isEditionMode = false;
  }
}
