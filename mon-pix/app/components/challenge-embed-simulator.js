import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/string';

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
    iframe.onload = () => {
      if (embedUrl) {
        thisComponent.isLoadingEmbed = false;
      }
    };
  }

  @action
  launchSimulator(event) {
    const iframe = this._getIframe(event);

    // TODO: use correct targetOrigin once the embeds are hosted behind our domain
    iframe.contentWindow.postMessage('launch', '*');
    iframe.focus();
    this.isSimulatorLaunched = true;
  }

  @action
  rebootSimulator(event) {
    const iframe = this._getIframe(event);
    const tmpSrc = iframe.src;

    // First onload: when we reset the iframe
    iframe.onload = () => {
      // Second onload: when we re-assign the iframe's src to its original value
      iframe.onload = () => {
        iframe.contentWindow.postMessage('reload', '*');
        iframe.focus();
      };
      iframe.src = tmpSrc;
    };
    iframe.src = '';
  }

  _getIframe(event) {
    return event.currentTarget.parentElement.parentElement.querySelector('.embed__iframe');
  }
}
