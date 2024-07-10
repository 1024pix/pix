import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';

export default class ModulixEmbed extends Component {
  embedHeight = this.args.embed.height;

  get embedDocumentHeightStyle() {
    return htmlSafe(`height: ${this.embedHeight}px`);
  }

  <template>
    <div class="element-embed">
      <iframe src={{@embed.url}} title={{@embed.title}} style={{this.embedDocumentHeightStyle}}>
      </iframe>
    </div>
  </template>
}
