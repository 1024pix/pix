import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
export default class ChallengeEmbedSimulator extends Component {
  get embedDocumentHeightStyle() {
    const height = this.args.height ?? '600';
    return htmlSafe(`height: ${height}px`);
  }
}
