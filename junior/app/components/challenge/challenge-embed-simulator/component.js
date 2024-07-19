import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';

export default class ChallengeEmbedSimulator extends Component {
  get embedDocumentHeightStyle() {
    const baseHeight = this.args.height ?? '600';
    const itemMedia = document.getElementsByClassName('challenge-item__media ')[0];
    const height = this.args.isMediaWithForm ? (baseHeight * itemMedia.offsetWidth) / 710 : baseHeight;
    return htmlSafe(`height: ${height}px; max-height: ${baseHeight}px`);
  }

  @action
  async handleAnswer(event) {
    this.args.setAnswerValue(event.detail.answer);
  }
}
