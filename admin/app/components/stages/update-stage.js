import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import isInteger from 'lodash/isInteger';

export default class UpdateStage extends Component {
  @service notifications;

  @tracked threshold;
  @tracked level;
  @tracked title;
  @tracked message;
  @tracked prescriberTitle;
  @tracked prescriberDescription;
  @tracked thresholdStatus = 'default';
  @tracked titleStatus = 'default';
  @tracked messageError = null;

  constructor() {
    super(...arguments);
    this.threshold = this.args.stage.threshold;
    this.level = this.args.stage.level?.toString();
    this.title = this.args.stage.title;
    this.message = this.args.stage.message;
    this.prescriberTitle = this.args.stage.prescriberTitle;
    this.prescriberDescription = this.args.stage.prescriberDescription;
  }

  async _updateStage() {
    const model = this.args.stage;
    model.threshold = this.threshold ?? null;
    model.level = this.level ?? null;
    model.title = this.title ? this.title.trim() : null;
    model.message = this.message ? this.message.trim() : null;
    model.prescriberTitle = this.prescriberTitle ? this.prescriberTitle.trim() : null;
    model.prescriberDescription = this.prescriberDescription ? this.prescriberDescription.trim() : null;
    try {
      await model.save();
      await this.notifications.success('Les modifications ont bien été enregistrées.');
      this.args.toggleEditMode();
    } catch (e) {
      model.rollbackAttributes();
      this.notifications.error(e.errors?.[0]?.detail ?? 'Une erreur est survenue.');
    }
  }

  @action
  async updateStage(event) {
    event.preventDefault();
    if ([this.thresholdStatus, this.titleStatus].includes('error')) return;
    await this._updateStage();
  }

  @action
  setLevel(level) {
    this.level = level;
  }

  @action
  checkThresholdValidity(event) {
    const newThreshold = Number(event.target.value);
    if (
      !isInteger(newThreshold) ||
      newThreshold < 0 ||
      newThreshold > 100 ||
      this.args.unavailableThresholds.includes(newThreshold)
    ) {
      this.thresholdStatus = 'error';
      this.threshold = null;
      return;
    }

    this.thresholdStatus = 'success';
    this.threshold = newThreshold;
  }

  @action
  checkTitleValidity(event) {
    const title = event.target.value.trim();

    if (!title) {
      this.titleStatus = 'error';
      this.title = null;
      return;
    }
    this.titleStatus = 'success';
    this.title = title;
  }

  @action
  checkMessageValidity(event) {
    const message = event.target.value.trim();

    if (!message) {
      this.message = null;

      this.messageError = 'Message vide.';
      return;
    }
    this.messageError = null;
    this.message = message;
  }
}
