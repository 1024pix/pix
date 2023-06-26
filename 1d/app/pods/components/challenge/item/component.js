import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Item extends Component {
  @service store;
  @service router;
  @tracked answerHasBeenValidated = false;
  @tracked answer = null;
  @tracked answerValue = null;
  @tracked showWarningModal = false;

  @action
  setAnswerValue(value) {
    this.answerValue = value;
  }

  _createAnswer(challenge) {
    return this.store.createRecord('answer', { challenge });
  }

  @action
  async validateAnswer() {
    if (this.answerValue) {
      this.answer = this._createAnswer(this.args.challenge);
      this.answer.value = this.answerValue;
      this.answer.assessment = this.args.assessment;
      try {
        await this.answer.save();
        this.answerHasBeenValidated = true;
      } catch (error) {
        this.answer.rollbackAttributes();
      }
    } else {
      this.showWarningModal = true;
    }
  }

  @action
  skipChallenge() {
    this.setAnswerValue('#ABAND#');
    return this.validateAnswer();
  }

  @action
  resume() {
    this.answerHasBeenValidated = false;
    this.answerValue = null;
    //TODO: Réinitiliser this.answer
    //On voulait réinitialiser this.answer à null pour repartir sur de bonnes bases,
    //mais on ne le fait pas car sinon on affiche une valeur non désirée dans la modale;
    this.router.transitionTo('assessment.resume');
  }

  @action
  onCloseWarningModal() {
    this.showWarningModal = false;
  }
}
