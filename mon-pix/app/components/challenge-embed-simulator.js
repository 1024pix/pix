import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { isEmbedAllowedOrigin } from 'mon-pix/utils/embed-allowed-origins';

export default class ChallengeEmbedSimulator extends Component {
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

  configureIframe(iframe, params) {
    const embedUrl = params[0];
    const thisComponent = params[1];

    thisComponent.isLoadingEmbed = true;
    thisComponent.isSimulatorLaunched = false;

    const loadListener = () => {
      if (embedUrl) {
        thisComponent.isLoadingEmbed = false;
      }
      iframe.removeEventListener('load', loadListener);
    };

    iframe.addEventListener('load', loadListener);

    thisComponent._embedMessageListener = ({ origin, data }) => {
      if (!isEmbedAllowedOrigin(origin)) return;
      if (isReadyMessage(data) && thisComponent.isSimulatorLaunched) {
        iframe.contentWindow.postMessage('launch', '*');
        iframe.focus();
      }
      if (isHeightMessage(data)) {
        thisComponent.embedHeight = data.height;
      }
      if (isAutoLaunchMessage(data)) {
        thisComponent.launchSimulator();
        thisComponent.isSimulatorRebootable = false;
      }
    };

    window.addEventListener('message', thisComponent._embedMessageListener);
  }

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
        iframe.contentWindow.postMessage('reload', '*');
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
 * Checks if event is a "ready" message.
 * @param {unknown} data
 * @returns {boolean}
 */
function isReadyMessage(data) {
  return isMessageType(data, 'ready');
}

/**
 * Checks if event is a "height" message.
 * @param {unknown} data
 * @returns {data is { height: number }}
 */
function isHeightMessage(data) {
  return isMessageType(data, 'height');
}

/**
 * Checks if event is a "auto-launch" message.
 * @param {unknown} data
 * @returns {boolean}
 */
function isAutoLaunchMessage(data) {
  return isMessageType(data, 'auto-launch');
}

function isMessageType(data, type) {
  if (typeof data !== 'object' || data === null) return false;
  return data.from === 'pix' && data.type === type;
}
