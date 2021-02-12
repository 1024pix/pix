import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class PublishSessionButtonComponent extends Component {

  @service notifications;

  @tracked displayConfirm = false;

  @action
  displayPublishConfirmationModal() {
    this.displayConfirm = true;
  }

  @action
  async publishSession() {
    try {
      await this.args.record.publish();
      this.args.record.unloadRecord();
    } catch (e) {
      this.notifyError(e);
    } finally {
      this.displayConfirm = false;
    }
  }

  notifyError(error) {
    if (error.errors && error.errors[0] && error.errors[0].detail) {
      const autoClear = error.errors[0].status != 503;
      this.notifications.error(error.errors[0].detail, { autoClear });
    } else {
      this.notifications.error(error);
    }
  }

  @action
  onCancelConfirm() {
    this.displayConfirm = false;
  }
}
