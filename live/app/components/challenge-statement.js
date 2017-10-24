import Component from '@ember/component';
import { computed } from '@ember/object';
import $ from 'jquery';
import moment from 'moment';

export default Component.extend({

  classNames: ['rounded-panel', 'challenge-statement'],

  attributeBindings: ['tabindex'],
  tabindex: -1,

  challenge: null,
  assessment: null,

  challengeInstruction: computed('challenge.instruction', function() {
    const instruction = this.get('challenge.instruction');
    if (!instruction) {
      return null;
    }
    return instruction.replace('${EMAIL}', this._formattedEmailForInstruction());
  }),

  init() {
    this._super(...arguments);
    this.id = 'challenge_statement_' + this.get('challenge.id');
  },

  didReceiveAttrs() {
    this._super(...arguments);
    $(`#${this.id}`).focus();
  },

  didInsertElement() {
    this._super(...arguments);
    $(`#${this.id}`).focus();
  },

  selectedAttachmentUrl: computed('challenge.attachments', function() {
    return this.get('challenge.attachments.firstObject');
  }),

  attachmentsData: computed('challenge.attachements', function() {
    return this.get('challenge.attachments');
  }),

  actions: {
    selectAttachementUrl(attachementUrl) {
      this.set('selectedAttachmentUrl', attachementUrl);
    }
  },

  _formattedEmailForInstruction: function() {
    return `${this.get('challenge.id')}-${this.get('assessment.id')}-${moment().format('DDMM')}@pix.beta.gouv.fr`;
  },
});
