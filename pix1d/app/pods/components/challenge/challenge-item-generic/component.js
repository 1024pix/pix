import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class ChallengeItemGeneric extends Component {
  @action
  validateAnswer() {
    return this.args.answerValidated(this.args.challenge, this.args.assessment, this._getAnswerValue());
  }
}
