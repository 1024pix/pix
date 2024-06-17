import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';

export default class ChallengeEmbedSimulator extends Component {
  get embedDocumentHeightStyle() {
    const baseHeight = this.args.height ?? '600';
    const height = this.args.isMediaWithForm ? (baseHeight * window.innerHeight) / 950 : baseHeight;
    return htmlSafe(`height: ${height}px`);
  }
}
