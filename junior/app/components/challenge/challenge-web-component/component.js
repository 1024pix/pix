import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class ChallengeWebComponent extends Component {
  @action
  handleAnswer(event) {
    this.args.setAnswerValue(event.detail[0]);
  }
}
