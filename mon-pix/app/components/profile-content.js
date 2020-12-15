import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ProfileContent extends Component {
  @service currentUser;

  get showNewLevelInfo() {
    return !this.currentUser.user.hasSeenNewLevelInfo;
  }
  @action
  async closeInformationAboutNewLevel() {
    await this.currentUser.user.save({ adapterOptions: { rememberUserHasSeenNewLevelInfo: true } });
  }
}
