import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class UpdateStage extends Component {
  @service notifications;

  @tracked threshold;
  @tracked level;
  @tracked title;
  @tracked message;
  @tracked prescriberTitle;
  @tracked prescriberDescription;

  constructor() {
    super(...arguments);
    this.threshold = this.args.stage.threshold;
    this.level = this.args.stage.level;
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
    } catch (error) {
      model.rollbackAttributes();
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  async updateStage(event) {
    event.preventDefault();
    await this._updateStage();
  }

  @action
  setLevel(level) {
    this.level = level;
  }
}
