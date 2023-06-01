import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Item extends Component {
  @service store;
  @service router;
  @tracked answerHasBeenValidated = false;
  @tracked answer = null;

  _createAnswer(challenge) {
    return this.store.createRecord('answer', { challenge });
  }

  @action
  async answerValidated(challenge, assessment, answerValue) {
    this.answer = this._createAnswer(challenge);
    this.answer.value = answerValue;
    this.answer.assessment = assessment;
    try {
      await this.answer.save();
      this.answerHasBeenValidated = true;
    } catch (error) {
      this.answer.rollbackAttributes();
    }
  }

  @action
  resume() {
    this.answerHasBeenValidated = false;
    this.answer = null;
    this.router.transitionTo('assessment.resume');
  }
}
