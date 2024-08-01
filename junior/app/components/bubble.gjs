import Component from '@glimmer/component';
import MarkdownToHtml from 'junior/components/markdown-to-html';

export default class Bubble extends Component {
  get getClasses() {
    let className = 'bubble';
    if (this.args.status) {
      className += ` bubble--${this.args.status}`;
    }
    return className;
  }
  <template><MarkdownToHtml ...attributes @markdown={{@message}} @class={{this.getClasses}} /></template>
}
