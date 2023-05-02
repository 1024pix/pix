import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import { isEmbedAllowedOrigin } from 'mon-pix/utils/embed-allowed-origins';

export default class ChallengeEmbedSimulator extends Component {
  @tracked
  isLoadingEmbed = true;

  @tracked
  isSimulatorLaunched = false;

  get embedDocumentHeightStyle() {
    if (this.args.embedDocument) {
      return htmlSafe(`height: ${this.args.embedDocument.height}px`);
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
  }

  @action
  launchSimulator(event) {
    const iframe = this._getIframe(event);
    iframe.contentWindow.postMessage('launch', '*');
    iframe.focus();
    this.isSimulatorLaunched = true;
    window.addEventListener('message', (e) => {
      if (!isEmbedAllowedOrigin(e.origin)) return;
      if (typeof e.data !== 'object' || e.data.from !== 'pix' || e.data.type !== 'ready') return;
      iframe.contentWindow.postMessage('launch', '*');
      iframe.focus();
    });
  }

  @action
  rebootSimulator(event) {
    const iframe = this._getIframe(event);
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

  _getIframe(event) {
    return event.currentTarget.parentElement.parentElement.querySelector('.embed__iframe');
  }
}
