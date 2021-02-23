import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class UserAccountPanel extends Component {
  @service intl;
  @service url;
  @service location;

  get displayUsername() {
    return !!this.args.user.username;
  }

  get displayLanguageSwitch() {
    return !this.url.isFrenchDomainExtension;
  }

  @action
  async onChangeLang(event) {

    if (!this.url.isFrenchDomainExtension) {
      this.location.replace(`/mon-compte?lang=${event.target.value}`);
    }
  }

  options = [
    {
      label: this.intl.t('pages.user-account.account-panel.fields.select.labels.french'),
      value: 'fr',
    },
    {
      label: this.intl.t('pages.user-account.account-panel.fields.select.labels.english'),
      value: 'en',
    },
  ];
}
