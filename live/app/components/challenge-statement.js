import Ember from 'ember';

const ChallengeStatement = Ember.Component.extend({

  selectedAttachmentUrl: null,

  init() {
    this._super(...arguments);
    this.selectedAttachmentUrl = this.get('challenge.attachments.firstObject');
  },

  didInsertElement() {
    this._super(...arguments);
    const selectedRadio = this.$(`.challenge-statement__file-option-input[value="${this.selectedAttachmentUrl}"]`);
    selectedRadio.attr('checked', 'checked');
  },

  actions: {
    selectAttachementUrl(attachementUrl) {
      this.set('selectedAttachmentUrl', attachementUrl);
    }
  }
});

ChallengeStatement.reopenClass({
  positionalParams: ['challenge']
});

export default ChallengeStatement;
