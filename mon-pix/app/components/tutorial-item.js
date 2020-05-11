import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const buttonStatusTypes = {
  unrecorded: 'unrecorded',
  pending: 'pending',
  recorded: 'recorded',
};

export default class TutorialItemComponent extends Component {
  @service store;
  @service currentUser;

  imageForFormat = {
    'vidéo': 'video',
    'son': 'son',
    'page': 'page'
  };
  @tracked savingStatus = buttonStatusTypes.unrecorded;
  @tracked evaluationStatus = buttonStatusTypes.unrecorded;

  constructor(owner, args) {
    super(owner, args);
    this.savingStatus = this.tutorial.isSaved ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
    this.evaluationStatus = this.tutorial.isEvaluated ? buttonStatusTypes.recorded : buttonStatusTypes.unrecorded;
  }

  get tutorial() {
    return this.args.tutorial;
  }

  get formatImageName() {
    const format = this.args.tutorial.format;
    if (this.imageForFormat[format]) {
      return this.imageForFormat[format];
    }
    return 'page';
  }

  get isSaved() {
    return this.savingStatus === buttonStatusTypes.recorded;
  }

  get isEvaluated() {
    return this.evaluationStatus === buttonStatusTypes.recorded;
  }

  get buttonText() {
    return this.savingStatus === buttonStatusTypes.recorded ? 'Retirer' : 'Enregistrer';
  }

  get buttonTitle() {
    return this.savingStatus === buttonStatusTypes.recorded ? 'Retirer' : 'Enregistrer dans ma liste de tutos';
  }

  get isSaveButtonDisabled() {
    return this.savingStatus === buttonStatusTypes.pending;
  }

  get isEvaluateButtonDisabled() {
    return this.evaluationStatus !== buttonStatusTypes.unrecorded;
  }

  @action
  async saveTutorial() {
    this.savingStatus = buttonStatusTypes.pending;
    const userTutorial = this.store.createRecord('userTutorial', { tutorial: this.tutorial });
    try {
      await userTutorial.save({ adapterOptions: { tutorialId: this.tutorial.id } });
      userTutorial.tutorial = this.tutorial;
      this.savingStatus = buttonStatusTypes.recorded;
    } catch (e) {
      this.savingStatus = buttonStatusTypes.unrecorded;
    }
  }

  @action
  async removeTutorial() {
    this.savingStatus = buttonStatusTypes.pending;
    try {
      await this.tutorial.userTutorial.destroyRecord({ adapterOptions: { tutorialId: this.tutorial.id } });
      this.savingStatus = buttonStatusTypes.unrecorded;
    } catch (e) {
      this.savingStatus = buttonStatusTypes.recorded;
    }
  }

  @action
  async evaluateTutorial() {
    this.evaluationStatus = buttonStatusTypes.pending;
    const tutorialEvaluation = this.store.createRecord('tutorialEvaluation', { tutorial: this.tutorial });
    try {
      await tutorialEvaluation.save({ adapterOptions: { tutorialId: this.tutorial.id } });
      tutorialEvaluation.tutorial = this.tutorial;
      this.evaluationStatus = buttonStatusTypes.recorded;
    } catch (e) {
      this.evaluationStatus = buttonStatusTypes.unrecorded;
    }
  }
}
