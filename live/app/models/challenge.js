import Ember from 'ember';
import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;

export default Model.extend({

  instruction: attr('string'),
  proposals: attr('string'),
  hasntInternetAllowed: attr('boolean'),
  timer: attr('number'),
  illustrationUrl: attr('string'),
  type: attr('string'),

  attachments: attr('array'),
  answer: belongsTo('answer'),

  hasAttachment: Ember.computed.notEmpty('attachments'),
  hasSingleAttachment: Ember.computed.equal('attachments.length', 1),
  hasMultipleAttachments: Ember.computed.gt('attachments.length', 1),
  hasTimer: Ember.computed.notEmpty('timer')
});
