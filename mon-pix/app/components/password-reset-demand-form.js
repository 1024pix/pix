import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PasswordResetDemandForm extends Component {
  @service store;
  @service url;

  @tracked hasFailed = false;
  @tracked hasSucceeded = false;
  @tracked isButtonEnabled = true;

  email = '';

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async savePasswordResetDemand(event) {
    event && event.preventDefault();
    this.hasFailed = false;
    this.hasSucceeded = false;
    this.isButtonEnabled = false;

    if (!this.email) {
      return;
    }

    try {
      const passwordResetDemand = await this.store.createRecord('password-reset-demand', { email: this.email.trim() });
      await passwordResetDemand.save();
      this.hasSucceeded = true;
    } catch (error) {
      this.hasFailed = true;
      this.isButtonEnabled = true;
    }
  }
}
