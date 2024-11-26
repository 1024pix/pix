import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { htmlUnsafe } from '../../../helpers/html-unsafe';
import didInsert from '../../../modifiers/modifier-did-insert';
import { isEmbedAllowedOrigin } from '../../../utils/embed-allowed-origins';
import ModuleElement from './module-element';

export default class ModulixEmbed extends ModuleElement {
  @tracked
  isSimulatorLaunched = false;
  @tracked
  hasSimulatorEnded = false;
  embedHeight = this.args.embed.height;
  iframe;
  messageHandler = null;

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

    this.messageHandler = this._receiveEmbedMessage.bind(this);
    window.addEventListener('message', this.messageHandler);
  }

  stopSimulator() {
    this.hasSimulatorEnded = true;
  }

  _receiveEmbedMessage(event) {
    if (!isEmbedAllowedOrigin(event.origin)) return;
    const message = this._getMessageFromEventData(event);
    if (message && message.answer && message.from === 'pix') {
      this.stopSimulator();
      this.args.onAnswer({
        userResponse: [message.answer],
        element: this.args.embed,
      });
    }
  }

  _getMessageFromEventData(event) {
    if (typeof event.data === 'object') {
      return event.data;
    }

    return {};
  }

  willDestroy() {
    window.removeEventListener('message', this.messageHandler);
  }

  <template>
    <div class="element-embed">
      {{#if @embed.instruction}}
        <div class="element-embed__instruction">
          {{htmlUnsafe @embed.instruction}}
        </div>
      {{/if}}

      <div class="element-embed__container">
        <iframe
          class="element-embed-container__iframe
            {{unless this.isSimulatorLaunched 'element-embed-container__iframe--blurred'}}"
          src={{@embed.url}}
          title={{@embed.title}}
          style={{this.heightStyle}}
          {{didInsert this.setIframeHtmlElement}}
        ></iframe>

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

        {{#if this.hasSimulatorEnded}}
          <div class="element-embed-container__overlay">
            <div class="element-embed-container-overlay__message">
              {{! template-lint-disable "no-bare-strings" }}
              <strong>Bravo !</strong>
              {{! template-lint-disable "no-bare-strings" }}
              <p>Vous pouvez continuer.</p>
            </div>
          </div>
        {{/if}}
      </div>

      {{#if this.isSimulatorLaunched}}
        <div class="element-embed__reset">
          <PixButton
            @iconBefore="refresh"
            @variant="tertiary"
            @triggerAction={{this.resetEmbed}}
            aria-label="{{t 'pages.modulix.buttons.embed.reset.ariaLabel'}}"
          >{{t "pages.modulix.buttons.embed.reset.name"}}</PixButton>
        </div>
      {{/if}}
    </div>
  </template>
}
