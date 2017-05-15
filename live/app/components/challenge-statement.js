import Ember from 'ember';

export default  Ember.Component.extend({

  classNames: ['rounded-panel', 'challenge-statement'],

  challenge: null,

  selectedAttachmentUrl: Ember.computed('challenge.attachments', function() {
    return this.get('challenge.attachments.firstObject');
  }),

  attachmentsData: Ember.computed('challenge.attachements', function() {
    return this.get('challenge.attachments');
  }),

  actions: {
    selectAttachementUrl(attachementUrl) {
      this.set('selectedAttachmentUrl', attachementUrl);
    }
  }
});
