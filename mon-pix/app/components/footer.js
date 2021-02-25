import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class Footer extends Component {
  @service url;
  @service intl;
  @service currentDomain;

  get shouldShowTheMarianneLogo() {
    return this.url.isFrenchDomainExtension;
  }

  get currentYear() {
    const date = new Date();
    return date.getFullYear().toString();
  }

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }
}
