import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import buttonStatusTypes from 'mon-pix/utils/button-status-types';
import { inject as service } from '@ember/service';

export default class Card extends Component {
  @service intl;
  @service store;

  @tracked savingStatus;
  @tracked evaluationStatus;

  constructor(owner, args) {
    super(owner, args);
    this.savingStatus = args.tutorial.isSaved ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
    this.evaluationStatus = args.tutorial.isEvaluated ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
  }

  get buttonLabel() {
    return this.savingStatus === buttonStatusTypes.recorded
      ? this.intl.t('pages.user-tutorials.list.tutorial.actions.remove.label')
      : this.intl.t('pages.user-tutorials.list.tutorial.actions.save.label');
  }

  get isSaved() {
    return this.savingStatus === buttonStatusTypes.recorded;
  }

  get isTutorialEvaluated() {
    return this.evaluationStatus !== buttonStatusTypes.unrecorded;
  }

  get isTutorialSaved() {
    return this.savingStatus !== buttonStatusTypes.unrecorded;
  }

  get isSaveButtonDisabled() {
    return this.savingStatus === buttonStatusTypes.pending;
  }

  @action
  async toggleSaveTutorial() {
    if (this.isSaved) {
      await this._removeTutorial();
    } else {
      await this._saveTutorial();
    }
  }

  async _saveTutorial() {
    this.savingStatus = buttonStatusTypes.pending;
    try {
      const userTutorial = this.store.createRecord('userTutorial', { tutorial: this.args.tutorial });
      await userTutorial.save({ adapterOptions: { tutorialId: this.args.tutorial.id } });
      this.savingStatus = buttonStatusTypes.recorded;
    } catch (e) {
      this.savingStatus = buttonStatusTypes.unrecorded;
    }
  }

  async _removeTutorial() {
    this.savingStatus = buttonStatusTypes.pending;
    try {
      await this.args.tutorial.userTutorial.destroyRecord({ adapterOptions: { tutorialId: this.args.tutorial.id } });
      this.savingStatus = buttonStatusTypes.unrecorded;
    } catch (e) {
      this.savingStatus = buttonStatusTypes.recorded;
    }
    await this.args.afterRemove?.();
  }

  @action
  async evaluateTutorial() {
    this.evaluationStatus = buttonStatusTypes.pending;
    try {
      const tutorialEvaluation = this.store.createRecord('tutorialEvaluation', { tutorial: this.args.tutorial });
      await tutorialEvaluation.save({ adapterOptions: { tutorialId: this.args.tutorial.id } });
      this.evaluationStatus = buttonStatusTypes.recorded;
    } catch (e) {
      this.evaluationStatus = buttonStatusTypes.unrecorded;
    }
  }
}
