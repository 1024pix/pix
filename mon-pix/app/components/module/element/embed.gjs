import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class ModulixEmbed extends Component {
  @tracked
  isSimulatorLaunched = false;
  embedHeight = this.args.embed.height;

  get heightStyle() {
    return htmlSafe(`height: ${this.embedHeight}px`);
  }

  @action
  startSimulator() {
    this.isSimulatorLaunched = true;
  }

  <template>
    <div class="element-embed">
      {{#unless this.isSimulatorLaunched}}
        <div class="element-embed__overlay">
          <PixButton
            @triggerAction={{this.startSimulator}}
            aria-label="{{t 'pages.modulix.buttons.embed.start.ariaLabel'}}"
            @variant="primary-bis"
            @size="large"
          >
            {{t "pages.modulix.buttons.embed.start.name"}}
          </PixButton>
        </div>
      {{/unless}}

      <iframe
        class="element-embed__iframe {{unless this.isSimulatorLaunched 'element-embed__iframe--blurred'}}"
        src={{@embed.url}}
        title={{@embed.title}}
        style={{this.heightStyle}}
      ></iframe>
    </div>
  </template>
}
