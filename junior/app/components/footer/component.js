import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Footer extends Component {
  @service url;

  get legalNoticesUrl() {
    return this.url.legalNoticesUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }
}
