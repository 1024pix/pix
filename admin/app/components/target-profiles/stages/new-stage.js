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
    if (
      !isInteger(threshold) ||
      this.args.unavailableThresholds.includes(threshold) ||
      threshold < 0 ||
      threshold > 100
    ) {
      this.args.stage.set('threshold', null);
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
      this.args.stage.set('title', null);
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
      this.args.stage.set('message', null);
      return;
    }
    this.messageStatus = 'success';
    this.args.stage.set('message', message);
  }
}
