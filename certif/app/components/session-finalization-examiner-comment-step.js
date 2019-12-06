import Component from '@ember/component';

// Bug known : carriages return under Safari in textareas
// are '\r\n' so the browser counts it as 2 characters
export default Component.extend({
  textareaMaxLength: 500,

  init() {
    this._super(...arguments);
    this.set('examinerComment', '');
  },

  actions: {
    updateTextareaValue(text) {
      const textareaMaxLength = this.get('textareaMaxLength');

      if (text.length <= textareaMaxLength) {
        this.set('examinerComment', text);
      }
    }
  }
});
