import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class ProfileSharingForm extends Component {
  @action
  async sendProfile(event) {
    event.preventDefault();
    await this.args.sendProfile();
  }
}
