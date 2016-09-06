import DS from 'ember-data';

import ProposalsAsArrayMixin from './challenge/proposals-as-array-mixin';
import ProposalsAsBlocksMixin from './challenge/proposals-as-blocks-mixin';

const { Model, attr } = DS;

const ChallengeModel = Model.extend(ProposalsAsArrayMixin, ProposalsAsBlocksMixin,
  {
    instruction: attr('string'),
    proposals: attr('string'),
    illustrationUrl: attr('string'),
    type: attr('string')
  });

export default ChallengeModel;
