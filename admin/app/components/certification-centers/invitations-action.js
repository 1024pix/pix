import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class CertificationCenterInvitationsAction extends Component {
  @service intl;

  @tracked invitationLanguage = this.languagesOptions[0].value;
  @tracked invitationRole = this.rolesOptions[0].value;

  get languagesOptions() {
    return [
      {
        label: 'Français',
        value: 'fr-fr',
      },
      {
        label: 'Francophone',
        value: 'fr',
      },
      {
        label: 'Anglais',
        value: 'en',
      },
    ];
  }

  get rolesOptions() {
    return [
      {
        label: this.intl.t('common.roles.admin'),
        value: 'ADMIN',
      },
      { label: this.intl.t('common.roles.member'), value: 'MEMBER' },
    ];
  }

  get certificationCenterRoleValue() {
    return this.invitationRole === 'NULL' ? null : this.invitationRole;
  }

  @action
  changeInvitationRole(value) {
    this.invitationRole = value;
  }

  @action
  changeInvitationLanguage(value) {
    this.invitationLanguage = value;
  }
}
