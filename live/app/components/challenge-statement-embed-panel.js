import Component from '@ember/component';

export default Component.extend({

  // Element
  classNames: ['challenge-statement-embed-panel rounded-panel'],

  // Data props
  embedDocument: null,

  // Actions
  actions: {
    reloadIframe() {
      this._reloadIframe();
    }
  },

  // Methods

  /* This method is extracted in order to test action binding easily */
  _reloadIframe() {
    const $iframe = this.element.getElementsByClassName('challenge-statement-embed-panel__iframe').item(0);
    $iframe.src = $iframe.src;
  }

});
