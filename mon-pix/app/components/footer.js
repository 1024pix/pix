import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class Footer extends Component {
  @service url;

  @tracked date;

  get shouldShowTheMarianneLogo() {
    return this.url.isFrenchDomainExtension;
  }

  get currentYear() {
    this.date = new Date();
    return this.date.getFullYear().toString();
  }

  get isPixContest() {
    return ENV.APP.IS_PIX_CONTEST === 'true';
  }
}
