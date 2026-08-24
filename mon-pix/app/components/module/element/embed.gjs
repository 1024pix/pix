import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { htmlUnsafe } from '../../../helpers/html-unsafe';
import didInsert from '../../../modifiers/modifier-did-insert';
import { isEmbedAllowedOrigin } from '../../../utils/embed-allowed-origins';
import ModulixIssueReportBlock from '../issue-report/issue-report-block';
import ModuleElement from './module-element';

export default class ModulixEmbed extends ModuleElement {
  constructor(...args) {
    super(...args);

    this.messageHandler = this._receiveEmbedMessage.bind(this);
    this.embedHeight = this.args.embed.height;
    window.addEventListener('message', this.messageHandler);

    this.reportInfo = {
      answer: null,
      elementId: this.args.embed.id,
      elementType: this.args.embed.type,
    };
  }

  @service
  embedApiProxy;

  @service
  modulixPreviewMode;

  @service
  passageEvents;

  @tracked
  isSimulatorLaunched = false;

  @tracked
  isSimulatorRebootable = true;

  @tracked
  embedHeight;

  @tracked
  reportInfo = {};

  iframe;
  messageHandler = null;

  @action
  setIframeHtmlElement(htmlElement) {
    this.iframe = htmlElement;
  }

  @action
  resetEmbed() {
    const tmpSrc = this.iframe.src;

    const loadListener = () => {
      const isFirstOnLoad = this.iframe.src === 'about:blank';
      if (isFirstOnLoad) {
        // First onload: when we reset the iframe
        this.iframe.setAttribute('src', tmpSrc);
      } else {
        // Second onload: when we re-assign the iframe's src to its original value
        this.iframe.focus();
        this.iframe.removeEventListener('load', loadListener);
      }
    };

    this.iframe.addEventListener('load', loadListener);

    this.iframe.setAttribute('src', 'about:blank');

    this.passageEvents.record({
      type: 'EMBED_RETRIED',
      data: {
        elementId: this.args.embed.id,
      },
    });
  }

  get heightStyle() {
    return htmlUnsafe(`height: ${this.embedHeight}px`);
  }

  get resetButtonDisplayed() {
    return this.isSimulatorLaunched && this.isSimulatorRebootable;
  }

  @action
  startSimulator() {
    this.isSimulatorLaunched = true;
    this.iframe.focus();
  }

  get permissionToClipboardWrite() {
    if (!this.args.embed?.url) {
      return null;
    }
    return isEmbedAllowedOrigin(this.args.embed.url) ? 'clipboard-write' : null;
  }

  _receiveEmbedMessage(event) {
    if (!this._messageIsFromCurrentElementSimulator(event)) return;
    if (!isEmbedAllowedOrigin(event.origin)) return;

    const message = this._getMessageFromEventData(event);

    if (message?.from !== 'pix') return;

    if (message.type === 'height') {
      this.embedHeight = message.height;
    }

    if (message.type === 'init') {
      if (message.enableFetchFromApi) {
        if (this.modulixPreviewMode.isEnabled) {
          return;
        }

        const [requestsPort] = event.ports;

        this.embedApiProxy.forward(this, requestsPort, this.args.passageId, 'passage');
      }

      if (!message.rebootable) {
        this.isSimulatorRebootable = false;
      }

      if (message.autoLaunch) {
        this.startSimulator();
      }
    }

    if (!this.args.embed.isCompletionRequired) return;

    if (message.type === 'terminate') {
      this.reportInfo = {
        answer: message.state,
        elementId: this.args.embed.id,
        type: this.args.embed.type,
      };

      this.args.onAnswer({
        userResponse: [message.state],
        element: this.args.embed,
      });

      this.passageEvents.record({
        type: 'EMBED_ANSWERED',
        data: {
          answer: message.state,
          elementId: this.args.embed.id,
          status: message.state === 'error' ? 'ko' : 'ok',
        },
      });
      return;
    }

    if (message.type) return;
    if (!message.answer) return;

    this.reportInfo = {
      answer: message.answer,
      elementId: this.args.embed.id,
      type: this.args.embed.type,
    };

    this.args.onAnswer({
      userResponse: [message.answer],
      element: this.args.embed,
    });

    this.passageEvents.record({
      type: 'EMBED_ANSWERED',
      data: {
        answer: message.answer,
        elementId: this.args.embed.id,
        status: 'ok',
      },
    });
  }

  _messageIsFromCurrentElementSimulator(event) {
    return event.source === this.iframe.contentWindow;
  }

  _getMessageFromEventData(event) {
    if (typeof event.data === 'object') {
      return event.data;
    }
    return null;
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

      <div
        class="element-embed__container
          {{if
            this.resetButtonDisplayed
            'element-embed__container--with-retry-button'
            'element-embed__container--without-retry-button'
          }}"
      >
        <iframe
          class="element-embed-container__iframe
            {{unless this.isSimulatorLaunched 'element-embed-container__iframe--blurred'}}"
          src={{@embed.url}}
          title={{@embed.title}}
          style={{this.heightStyle}}
          allow="{{this.permissionToClipboardWrite}}"
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
      </div>

      <div class={{if this.resetButtonDisplayed "element-embed__buttons" "element-embed__button"}}>
        <ModulixIssueReportBlock @reportInfo={{this.reportInfo}} />

        {{#if this.resetButtonDisplayed}}
          <PixButton
            class="element-embed-buttons__retry"
            @iconBefore="refresh"
            @variant="tertiary"
            @triggerAction={{this.resetEmbed}}
            aria-label="{{t 'pages.modulix.buttons.interactive-element.reset.ariaLabel'}}"
          >{{t "pages.modulix.buttons.interactive-element.reset.name"}}</PixButton>
        {{/if}}
      </div>
    </div>
  </template>
}
