import Component from '@ember/component';

export default Component.extend({

  // Element
  classNames: ['challenge-statement-embed-panel rounded-panel'],

  // Data props
  embedDocument: null,

  // Actions
  actions: {
    launchSimulator() {
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
    const $simulatorIframe = this.element.getElementsByClassName('challenge-statement-embed-panel__iframe').item(0);
    $simulatorIframe.src = $simulatorIframe.src;
  },

  _unblurSimulator() {
    const $simulatorPanel = this.element.getElementsByClassName('challenge-statement-embed-panel__simulator').item(0);
    $simulatorPanel.classList.remove('blurred');
  }
});
