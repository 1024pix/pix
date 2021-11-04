import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganizationInvitationsAction extends Component {
  @tracked organizationInvitationLang = this.languagesOptions[0].value;
  @tracked organizationInvitationRole = this.rolesOptions[0].value;

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
        label: 'Sans rôle',
        value: 'NULL',
      },
      {
        label: 'Rôle Membre',
        value: 'MEMBER',
      },
      {
        label: 'Rôle Administrateur',
        value: 'ADMIN',
      },
    ];
  }

  get organizationInvitationRoleValue() {
    return this.organizationInvitationRole === 'NULL' ? null : this.organizationInvitationRole;
  }

  @action
  changeOrganizationInvitationRole(event) {
    this.organizationInvitationRole = event.target.value ? event.target.value : null;
  }

  @action
  changeOrganizationInvitationLang(event) {
    this.organizationInvitationLang = event.target.value;
  }
}
