import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isInteger from 'lodash/isInteger';

export default class NewStage extends Component {
  @tracked thresholdStatus = 'default';
  @tracked titleStatus = 'default';
  @tracked messageStatus = 'default';

  @action
  checkThresholdValidity(event) {
    const threshold = Number(event.target.value);
    if (!isInteger(threshold)) {
      this.thresholdStatus = 'error';
      return;
    }
    if (this.args.unavailableThresholds.includes(threshold)) {
      this.thresholdStatus = 'error';
      return;
    }
    if (threshold < 0 || threshold > 100) {
      this.thresholdStatus = 'error';
      return;
    }

    this.thresholdStatus = 'success';
    this.args.stage.set('threshold', threshold);
  }

  @action
  checkTitleValidity(event) {
    const title = event.target.value.trim();

    if (!title) {
      this.titleStatus = 'error';
      return;
    }
    this.titleStatus = 'success';
    this.args.stage.set('title', title);
  }

  @action
  checkMessageValidity(event) {
    const message = event.target.value.trim();

    if (!message) {
      this.messageStatus = 'error';
      return;
    }
    this.messageStatus = 'success';
    this.args.stage.set('message', message);
  }
}
