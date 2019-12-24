import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import config from 'mon-pix/config/environment';

export default Component.extend({

  mailGenerator: service(),

  classNames: ['challenge-statement'],

  challenge: null,
  assessment: null,

  challengeInstruction: computed('challenge.instruction', function() {
    const instruction = this.get('challenge.instruction');
    if (!instruction) {
      return null;
    }
    return instruction.replace('${EMAIL}', this._formattedEmailForInstruction());
  }),

  challengeEmbedDocument: computed('challenge.hasValidEmbedDocument', function() {
    if (this.get('challenge.hasValidEmbedDocument')) {
      return {
        url: this.get('challenge.embedUrl'),
        title: this.get('challenge.embedTitle'),
        height: this.get('challenge.embedHeight')
      };
    }
    return undefined;
  }),

  init() {
    this._super(...arguments);
    this.id = 'challenge_statement_' + this.get('challenge.id');
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
    return this.mailGenerator
      .generateEmail(this.get('challenge.id'), this.get('assessment.id'), window.location.hostname, config.environment);
  },
});
