import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { htmlUnsafe } from '../../../helpers/html-unsafe';
import didInsert from '../../../modifiers/modifier-did-insert';

export default class ModulixEmbed extends Component {
  @tracked
  isSimulatorLaunched = false;
  embedHeight = this.args.embed.height;
  iframe;

  @action
  setIframeHtmlElement(htmlElement) {
    this.iframe = htmlElement;
  }

  @action
  resetEmbed() {
    this.iframe.setAttribute('src', this.args.embed.url);
    this.iframe.focus();
  }

  get heightStyle() {
    return htmlUnsafe(`height: ${this.embedHeight}px`);
  }

  @action
  startSimulator() {
    this.isSimulatorLaunched = true;
    this.iframe.focus();
  }

  <template>
    <div class="element-embed">
      {{#if @embed.instruction}}
        <div class="element-embed__instruction">
          {{htmlUnsafe @embed.instruction}}
        </div>
      {{/if}}

      <div class="element-embed__container">
        {{#unless this.isSimulatorLaunched}}
          <div class="element-embed-container__overlay">
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
          class="element-embed-container__iframe
            {{unless this.isSimulatorLaunched 'element-embed-container__iframe--blurred'}}"
          src={{@embed.url}}
          title={{@embed.title}}
          style={{this.heightStyle}}
          {{didInsert this.setIframeHtmlElement}}
        ></iframe>
      </div>

      {{#if this.isSimulatorLaunched}}
        <div class="element-embed__reset">
          <PixButton
            @iconBefore="rotate-right"
            @variant="tertiary"
            @triggerAction={{this.resetEmbed}}
            aria-label="{{t 'pages.modulix.buttons.embed.reset.ariaLabel'}}"
          >{{t "pages.modulix.buttons.embed.reset.name"}}</PixButton>
        </div>
      {{/if}}
    </div>
  </template>
}
