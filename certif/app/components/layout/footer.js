import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class Footer extends Component {
  @service intl;

  get currentYear() {
    const currentYear = new Date().getFullYear();
    return this.intl.t('navigation.footer.current-year', { currentYear });
  }
}
