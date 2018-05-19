import { computed } from '@ember/object';
import { notEmpty, equal, gt } from '@ember/object/computed';
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({

  instruction: attr('string'),
  proposals: attr('string'),
  timer: attr('number'),
  illustrationUrl: attr('string'),
  type: attr('string'),
  embedUrl: attr('string'),
  embedTitle: attr('string'),
  embedHeight: attr('string'),

  attachments: attr('array'),
  answer: belongsTo('answer'),

  hasValidEmbedDocument: computed('embedUrl', 'embedTitle', 'embedHeight', function() {
    const embedUrl = this.get('embedUrl');
    return !!embedUrl
      && !!this.get('embedTitle')
      && !!this.get('embedHeight')
      && embedUrl.toLowerCase().startsWith('https://');
  }),
  hasAttachment: notEmpty('attachments'),
  hasSingleAttachment: equal('attachments.length', 1),
  hasMultipleAttachments: gt('attachments.length', 1),
  hasTimer: notEmpty('timer')
});
