import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class PasswordResetDemandForm extends Component {
  @service errors;
  @service store;
  @service url;

  @tracked hasFailed = false;
  @tracked hasSucceeded = false;
  @tracked isButtonDisabled = false;

  email = '';

  get showcaseUrl() {
    return this.url.showcaseUrl;
  }

  get urlExtension() {
    return this.url.extensionUrl;
  }

  get error() {
    return this.errors.shift();
  }

  get hasErrors() {
    return this.hasFailed ? false : this.errors.hasErrors();
  }

  @action
  async savePasswordResetDemand(event) {
    event && event.preventDefault();
    this.hasFailed = false;
    this.hasSucceeded = false;
    this.isButtonDisabled = true;

    if (!this.email) {
      return;
    }

    try {
      const passwordResetDemand = await this.store.createRecord('password-reset-demand', { email: this.email.trim() });
      await passwordResetDemand.save();
      this.hasSucceeded = true;
    } catch (error) {
      this.hasFailed = true;
      this.isButtonDisabled = false;
    }
  }
}
