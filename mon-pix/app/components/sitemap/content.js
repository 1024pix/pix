import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class Content extends Component {
  @service url;
  @service intl;
  @service currentDomain;

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  get accessibilityUrl() {
    return this.url.accessibilityUrl;
  }

  get accessibilityHelpUrl() {
    return this.url.accessibilityHelpUrl;
  }

  get supportHomeUrl() {
    return this.url.supportHomeUrl;
  }
}
