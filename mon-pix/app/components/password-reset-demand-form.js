import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PasswordResetDemandForm extends Component {
  @service store;
  @service url;

  @tracked hasFailed = false;
  @tracked hasSucceeded = false;

  email = '';

  get homeUrl() {
    return this.url.homeUrl;
  }

  @action
  async savePasswordResetDemand(event) {
    event && event.preventDefault();
    this.hasFailed = false;
    this.hasSucceeded = false;

    const trimmedEmail = this.email ? this.email.trim() : '';

    try {
      const passwordResetDemand = await this.store.createRecord('password-reset-demand', { email: trimmedEmail });
      await passwordResetDemand.save();
      this.hasSucceeded = true;
    } catch (error) {
      this.hasFailed = true;
    }
  }
}
