import Ember from 'ember';
import DS from 'ember-data';
import ProposalsAsArrayMixin from './challenge/proposals-as-array-mixin';
import ProposalsAsBlocksMixin from './challenge/proposals-as-blocks-mixin';

const { Model, attr } = DS;

const ChallengeModel = Model.extend(ProposalsAsArrayMixin, ProposalsAsBlocksMixin, {

  instruction: attr('string'),
  proposals: attr('string'),
  hasntInternetAllowed: attr('boolean'),
  timer: attr('number'),
  illustrationUrl: attr('string'),
  type: attr('string'),

  attachments: attr('array'),
  hasAttachment: Ember.computed.notEmpty('attachments'),
  hasSingleAttachment: Ember.computed.equal('attachments.length', 1),
  hasMultipleAttachments: Ember.computed.gt('attachments.length', 1)

});

export default ChallengeModel;
