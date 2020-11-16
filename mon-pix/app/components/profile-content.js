import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class ProfileContent extends Component {

  get isPixContest() {
    return ENV.APP.IS_PIX_CONTEST === 'true';
  }
}
