import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Footer extends Component {
  @service intl;
  @service url;

  get currentYear() {
    const currentYear = new Date().getFullYear();
    return this.intl.t('navigation.footer.current-year', { currentYear });
  }

  get legalNoticeUrl() {
    return this.url.legalNoticeUrl;
  }

  get accessibilityUrl() {
    return this.url.accessibilityUrl;
  }
}
