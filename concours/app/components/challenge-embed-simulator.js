import Component from '@ember/component';
import { attributeBindings, classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';
import classic from 'ember-classic-decorator';

@classic
@classNames('challenge-embed-simulator')
@attributeBindings('embedDocumentHeightStyle:style')
export default class ChallengeEmbedSimulator extends Component {
  // Data props
  embedDocument = null;

  // CPs
  @computed('embedDocument.height')
  get embedDocumentHeightStyle() {
    return htmlSafe(`height: ${this.get('embedDocument.height')}px`);
  }

  @action
  launchSimulator() {
    const iframe = this._getIframe();

    // TODO: use correct targetOrigin once the embeds are hosted behind our domain
    iframe.contentWindow.postMessage('launch', '*');
    iframe.focus();

    this.toggleProperty('_isSimulatorNotYetLaunched');
    this._unblurSimulator();
  }

  @action
  rebootSimulator() {
    this._rebootSimulator();
  }

  // Internals
  _isSimulatorNotYetLaunched = true;

  _hiddenSimulatorClass = null;

  didUpdateAttrs() {
    this.set('_isSimulatorNotYetLaunched', true);
    this.set('_hiddenSimulatorClass', 'hidden-class');
  }

  didRender() {
    super.didRender(...arguments);
    const iframe = this._getIframe();
    iframe.onload = () => {
      this._removePlaceholder();
    };
  }

  _removePlaceholder() {
    if (this.embedDocument.url) {
      this.set('_hiddenSimulatorClass', null);
    }
  }

  _getIframe() {
    return this.element.querySelector('.embed__iframe');
  }

  /* This method is not tested because it would be too difficult (add an observer on a complicated stubbed DOM API element!) */
  _rebootSimulator() {
    const iframe = this._getIframe();
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

  _unblurSimulator() {
    const $simulatorPanel = this.element.getElementsByClassName('embed__simulator').item(0);
    $simulatorPanel.classList.remove('blurred');
  }
}
