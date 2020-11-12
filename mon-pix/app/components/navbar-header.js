import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class NavbarHeader extends Component {
  @service url;

  get isFrenchDomainExtension() {
    return this.url.isFrenchDomainExtension;
  }

  get isPixContest() {
    return ENV.APP.IS_PIX_CONTEST === 'true';
  }
}
