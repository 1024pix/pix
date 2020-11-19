import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ProfileContent extends Component {

  @service currentUser;

  get isPixContest() {
    return ENV.APP.IS_PIX_CONTEST === 'true';
  }

  get hasNotFinishedPixContest() {
    return !this.currentUser.user.finishedPixContestAt;
  }

  @action
  sendPixContestResults() {
    this.currentUser.user.save({ adapterOptions: { finishPixContest: true } });
  }
}
