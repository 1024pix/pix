import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
export default class ChallengeEmbedSimulator extends Component {
  get embedDocumentHeightStyle() {
    const height = this.args.height ?? '600';
    return htmlSafe(`height: ${height}px`);
  }
}
