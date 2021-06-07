/* eslint-disable ember/require-tagless-components */
/* eslint-disable ember/no-classic-components */

import Component from '@ember/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class OrganizationMembersSection extends Component {
  @tracked organizationInvitationLang = this.languagesOptions[0].value;

  get languagesOptions() {
    return [
      {
        'label': 'Français',
        'value': 'fr',
      },
      {
        'label': 'Anglais',
        'value': 'en',
      },
    ];
  }

  @action
  selectRole(event) {
    return this.selectRoleForSearch(event.target.value || null);
  }

  @action
  changeOrganizationInvitationLang(event) {
    this.organizationInvitationLang = event.target.value;
  }
}
