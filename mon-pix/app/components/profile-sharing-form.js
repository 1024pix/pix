import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class ProfileSharingForm extends Component {
  @action
  async sendProfile(event) {
    event.preventDefault();
    await this.args.sendProfile();
  }
}
