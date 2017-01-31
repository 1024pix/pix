import Ember from 'ember';
import DS from 'ember-data';
import ProposalsAsArrayMixin from './challenge/proposals-as-array-mixin';
import ProposalsAsBlocksMixin from './challenge/proposals-as-blocks-mixin';
import _ from 'pix-live/utils/lodash-custom';

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
  hasMultipleAttachments: Ember.computed.gt('attachments.length', 1),
  hasTimer: Ember.computed.notEmpty('timer'),

  challengeItemType: Ember.computed('type', function() {
    let result;
    const challengeType = this.get('type').toUpperCase();

    if (_(challengeType).isAmongst(['QCUIMG', 'QCU', 'QRU'])) {
      result = 'qcu';
    } else if (_(challengeType).isAmongst(['QCMIMG', 'QCM'])) {
      result = 'qcm';
    } else if (_(challengeType).isAmongst(['QROC'])) {
      result = 'qroc';
    } else if (_(challengeType).isAmongst(['QROCM', 'QROCM-IND', 'QROCM-DEP'])) {
      result = 'qrocm';
    }

    return 'challenge-item-' + result;
  })

});

export default ChallengeModel;
