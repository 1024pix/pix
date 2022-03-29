import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import buttonStatusTypes from 'mon-pix/utils/button-status-types';
import { inject as service } from '@ember/service';

export default class Card extends Component {
  @service intl;
  @service store;

  @tracked savingStatus = buttonStatusTypes.unrecorded;
  @tracked evaluationStatus = buttonStatusTypes.unrecorded;

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

  get isEvaluateButtonDisabled() {
    return this.evaluationStatus !== buttonStatusTypes.unrecorded;
  }

  @action
  async evaluateTutorial() {
    this.evaluationStatus = buttonStatusTypes.pending;
    const tutorialEvaluation = this.store.createRecord('tutorialEvaluation', { tutorial: this.args.tutorial });
    try {
      await tutorialEvaluation.save({ adapterOptions: { tutorialId: this.args.tutorial.id } });
      this.evaluationStatus = buttonStatusTypes.recorded;
    } catch (e) {
      this.evaluationStatus = buttonStatusTypes.unrecorded;
    }
  }
}
