import Component from '@ember/component';

export default Component.extend({

  tooltipText: 'Copier le lien direct',

  actions: {
    clipboardSuccess() {
      this.set('tooltipText', 'Copié !');
    },
    clipboardOut() {
      this.set('tooltipText', 'Copier le code d\'accès');
    },
  }
});
