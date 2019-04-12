import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({

  // Element
  classNames: ['challenge-embed-simulator rounded-panel'],
  attributeBindings: ['embedDocumentHeightStyle:style'],

  // Data props
  embedDocument: null,

  // CPs
  embedDocumentHeightStyle: computed('embedDocument.height', function() {
    return htmlSafe(`height: ${this.get('embedDocument.height')}px`);
  }),

  // Actions
  actions: {
    launchSimulator() {
      const iframe = this._getIframe();

      // TODO: use correct targetOrigin once the embeds are hosted behind our domain
      iframe.contentWindow.postMessage('launch', '*');
      iframe.focus();

      this.toggleProperty('_isSimulatorNotYetLaunched');
      this._unblurSimulator();
    },

    reloadSimulator() {
      this._reloadSimulator();
    }
  },

  // Internals
  _isSimulatorNotYetLaunched: true,

  _getIframe() {
    return this.element.querySelector('.challenge-embed-simulator__iframe');
  },

  /* This method is not tested because it would be too difficult (add an observer on a complicated stubbed DOM API element!) */
  _reloadSimulator() {
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
  },

  _unblurSimulator() {
    const $simulatorPanel = this.element.getElementsByClassName('challenge-embed-simulator__simulator').item(0);
    $simulatorPanel.classList.remove('blurred');
  }
});
