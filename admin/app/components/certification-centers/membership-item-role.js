import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class CertificationCentersMembershipItemRoleComponent extends Component {
  @service intl;

  get certificationCenterRoles() {
    return [
      { value: 'ADMIN', label: this.intl.t('common.roles.admin') },
      { value: 'MEMBER', label: this.intl.t('common.roles.member') },
    ];
  }
}
