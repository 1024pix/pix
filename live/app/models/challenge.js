import { computed } from '@ember/object';
import { notEmpty, equal, gt } from '@ember/object/computed';
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({

  instruction: attr('string'),
  proposals: attr('string'),
  hasntInternetAllowed: attr('boolean'),
  timer: attr('number'),
  illustrationUrl: attr('string'),
  type: attr('string'),
  embedUrl: attr('string'),
  embedTitle: attr('string'),
  embedHeight: attr('string'),

  attachments: attr('array'),
  answer: belongsTo('answer'),

  hasValidEmbed: computed('embedUrl', function() {
    return !!this.get('embedUrl')
      && !!this.get('embedTitle')
      && !!this.get('embedHeight');
  }),
  hasAttachment: notEmpty('attachments'),
  hasSingleAttachment: equal('attachments.length', 1),
  hasMultipleAttachments: gt('attachments.length', 1),
  hasTimer: notEmpty('timer')
});
