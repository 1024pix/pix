import Ember from 'ember';

export default  Ember.Component.extend({

  classNames: ['rounded-panel', 'challenge-statement'],

  attributeBindings: ['tabindex', 'id'],
  tabindex: -1,

  challenge: null,

  init() {
    this._super(...arguments);
    this.id = 'challenge_statement_'  + this.get('challenge.id');
  },

  didReceiveAttrs() {
    this._super(...arguments);
    Ember.$('#' + this.id).focus();
  },

  didInsertElement() {
    this._super(...arguments);
    Ember.$('#' + this.id).focus();
  },

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
