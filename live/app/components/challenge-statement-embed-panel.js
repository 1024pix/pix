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
    },

    reloadSimulator() {
      this._reloadSimulator();
    }
  },

  // Internals
  _isSimulatorNotYetLaunched: true,

  /* This method is extracted in order to test action binding easily */
  _reloadSimulator() {
    const $simulatorIframe = this.element.getElementsByClassName('challenge-statement-embed-panel__simulator').item(0);
    $simulatorIframe.src = $simulatorIframe.src;
  }

});
