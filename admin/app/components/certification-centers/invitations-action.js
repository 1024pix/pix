import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CertificationCenterInvitationsAction extends Component {
  @tracked invitationLanguage = this.languagesOptions[0].value;

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

  @action
  changeInvitationLanguage(value) {
    this.invitationLanguage = value;
  }
}
