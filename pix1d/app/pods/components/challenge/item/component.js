import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class Item extends Component {
  @service store;

  _createAnswer(challenge) {
    return this.store.createRecord('answer', { challenge });
  }

  @action
  async answerValidated(challenge, assessment, answerValue) {
    const answer = this._createAnswer(challenge);
    answer.value = answerValue;
    try {
      await answer.save();
      if (answer.result === 'ok') {
        alert('Réussi !!!!!!!!!!!!!!!!!');
      } else {
        alert('Raté');
      }
    } catch (error) {
      answer.rollbackAttributes();
    }
  }
}
