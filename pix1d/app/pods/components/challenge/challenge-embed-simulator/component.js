import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class ChallengeEmbedSimulator extends Component {
  get embedDocumentHeightStyle() {
    if (this.args.embedDocument) {
      return htmlSafe(`height: ${this.args.embedDocument.height}px`);
    }
    return '';
  }
}
