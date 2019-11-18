import Component from '@ember/component';
import { equal } from '@ember/object/computed';

export default Component.extend({

  isSessionFinalizationActive: null,

  tooltipText: 'Copier le lien direct',

  isSuccessMessage: equal('message.type', 'success'),
  isErrorMessage: equal('message.type', 'error'),

  actions: {
    clipboardSuccess() {
      this.set('tooltipText', 'Copié !');
    },

    clipboardOut() {
      this.set('tooltipText', 'Copier le code d\'accès');
    }
  }
});
