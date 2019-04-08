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
      const event = new CustomEvent('launch-embed');

      document.dispatchEvent(event);

      this.toggleProperty('_isSimulatorNotYetLaunched');
      this._unblurSimulator();
    },

    reloadSimulator() {
      this._reloadSimulator();
    }
  },

  // Internals
  _isSimulatorNotYetLaunched: true,

  /* This method is not tested because it would be too difficult (add an observer on a complicated stubbed DOM API element!) */
  _reloadSimulator() {
    const iframe = this.element.getElementsByClassName('challenge-embed-simulator__iframe').item(0);
    const tmpSrc = iframe.src;
    iframe.onload = function() {
      iframe.onload = '';
      iframe.src = tmpSrc;
    };
    iframe.src = '';
  },

  _unblurSimulator() {
    const $simulatorPanel = this.element.getElementsByClassName('challenge-embed-simulator__simulator').item(0);
    $simulatorPanel.classList.remove('blurred');
  }
});
