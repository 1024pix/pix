import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Footer extends Component {
  @service url;

  get currentYear() {
    const date = new Date();
    return date.getFullYear().toString();
  }

  get legalNoticeUrl() {
    return this.url.legalNoticeUrl;
  }

  get accessibilityUrl() {
    return this.url.accessibilityUrl;
  }

  get serverStatusUrl() {
    return this.url.serverStatusUrl;
  }
}
