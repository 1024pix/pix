import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import modifierDidInsert from 'mon-pix/modifiers/modifier-did-insert';
import { isEmbedAllowedOrigin } from 'mon-pix/utils/embed-allowed-origins';

export default class ChallengeEmbedSimulator extends Component {
  <template>
    {{! template-lint-disable style-concatenation no-inline-styles }}
    <div class="challenge-embed-simulator">
      {{#if this.isLoadingEmbed}}
        <div class="embed placeholder blurred" aria-label="{{t 'pages.challenge.embed-simulator.placeholder'}}">
          <PixIcon @name="image" />
        </div>
      {{/if}}

      <div class="embed rounded-panel {{if this.isLoadingEmbed 'hidden-visibility' ''}}">
        {{#unless this.isSimulatorLaunched}}
          <div class="embed__acknowledgment-overlay">
            <PixButton
              @triggerAction={{this.launchSimulator}}
              @variant="primary-bis"
              aria-label={{t "pages.challenge.embed-simulator.actions.launch-label"}}
            >
              {{t "pages.challenge.embed-simulator.actions.launch"}}
            </PixButton>
          </div>
        {{/unless}}

        <div class="embed__simulator {{unless this.isSimulatorLaunched 'blurred'}}">
          <iframe
            tabindex={{unless this.isSimulatorLaunched "-1"}}
            aria-hidden={{unless this.isSimulatorLaunched "true"}}
            class="embed__iframe"
            src="{{@embedDocument.url}}"
            title="{{@embedDocument.title}}"
            {{modifierDidInsert this.configureIframe @embedDocument.url this}}
            frameBorder="0"
            style="{{this.embedDocumentHeightStyle}}"
            allow="{{this.permissionToClipboardWrite}}"
          ></iframe>
        </div>

        {{#if this.isSimulatorRebootable}}
          <div class="embed__reboot">
            <button
              type="button"
              class="link link--grey embed-reboot__content"
              aria-label={{t "pages.challenge.embed-simulator.actions.reset-label"}}
              {{on "click" this.rebootSimulator}}
            >
              <PixIcon @name="refresh" @ariaHidden={{true}} class="embed-reboot-content__icon" />
              {{t "pages.challenge.embed-simulator.actions.reset"}}
            </button>
          </div>
        {{/if}}
      </div>
    </div>
  </template>

  @service
  embedApiProxy;

  @tracked
  isLoadingEmbed = true;

  @tracked
  isSimulatorLaunched = false;

  @tracked
  isSimulatorRebootable = true;

  @tracked
  embedHeight;

  _embedMessageListener;

  constructor(owner, args) {
    super(owner, args);
    this.embedHeight = args.embedDocument?.height;
  }

  get embedDocumentHeightStyle() {
    if (this.embedHeight) {
      return htmlSafe(`height: ${this.embedHeight}px`);
    }
    return '';
  }

  get permissionToClipboardWrite() {
    if (!this.args.embedDocument?.url) {
      return null;
    }
    return isEmbedAllowedOrigin(this.args.embedDocument.url) ? 'clipboard-write' : null;
  }

  configureIframe = (iframe, embedUrl, thisComponent) => {
    thisComponent.isLoadingEmbed = true;
    thisComponent.isSimulatorLaunched = false;

    const loadListener = () => {
      if (embedUrl) {
        thisComponent.isLoadingEmbed = false;
      }
      iframe.removeEventListener('load', loadListener);
    };

    iframe.addEventListener('load', loadListener);

    thisComponent._embedMessageListener = ({ origin, data, ports }) => {
      if (!isEmbedAllowedOrigin(origin)) return;
      if (isInitMessage(data)) {
        if (data.enableFetchFromApi) {
          const [requestsPort] = ports;

          this.embedApiProxy.forward(this, requestsPort, this.args.assessmentId, 'assessment');
        }

        if (data.autoLaunch || thisComponent.isSimulatorLaunched) {
          thisComponent.launchSimulator();
        }
        if (!data.rebootable) {
          thisComponent.isSimulatorRebootable = false;
        }
      }
      if (isHeightMessage(data)) {
        thisComponent.embedHeight = data.height;
      }
    };

    window.addEventListener('message', thisComponent._embedMessageListener);
  };

  @action
  launchSimulator() {
    const iframe = this.iframe;
    iframe.contentWindow.postMessage('launch', '*');
    iframe.focus();
    this.isSimulatorLaunched = true;
  }

  @action
  rebootSimulator() {
    const iframe = this.iframe;
    const tmpSrc = iframe.src;

    const loadListener = () => {
      if (iframe.src === 'about:blank') {
        // First onload: when we reset the iframe
        iframe.src = tmpSrc;
      } else {
        // Second onload: when we re-assign the iframe's src to its original value
        iframe.focus();
        iframe.removeEventListener('load', loadListener);
      }
    };

    iframe.addEventListener('load', loadListener);

    iframe.src = 'about:blank';
  }

  willDestroy() {
    super.willDestroy();
    window.removeEventListener('message', this._embedMessageListener);
  }

  get iframe() {
    return document.querySelector('.embed__iframe');
  }
}

/**
 * Checks if event is an "init" message.
 * @param {unknown} data
 * @returns {data is {
 *   autoLaunch: boolean
 *   rebootable: boolean
 * }}
 */
function isInitMessage(data) {
  return isMessageType(data, 'init');
}

/**
 * Checks if event is a "height" message.
 * @param {unknown} data
 * @returns {data is { height: number }}
 */
function isHeightMessage(data) {
  return isMessageType(data, 'height');
}

function isMessageType(data, type) {
  if (typeof data !== 'object' || data === null) return false;
  return data.from === 'pix' && data.type === type;
}
