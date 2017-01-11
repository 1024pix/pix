import DS from 'ember-data';
import ProposalsAsArrayMixin from './challenge/proposals-as-array-mixin';
import ProposalsAsBlocksMixin from './challenge/proposals-as-blocks-mixin';
import InstructionAsObject from './challenge/instruction-as-object-mixin';

const { Model, attr } = DS;

const ChallengeModel = Model.extend(InstructionAsObject, ProposalsAsArrayMixin, ProposalsAsBlocksMixin, {

  instruction: attr('string'),
  proposals: attr('string'),
  hasntInternetAllowed: attr('boolean'),
  timer: attr('number'),
  illustrationUrl: attr('string'),
  type: attr('string'),
  attachmentUrl: attr('string'),
  attachmentFilename: attr('string')

});

export default ChallengeModel;
