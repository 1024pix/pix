import { attr } from '@ember-data/model';
import Element from '../element/model';

export default class Qrocm extends Element {
  @attr('string') instruction;
  @attr() proposals;

  get formattedProposals() {
    return this.proposals.map((proposal) => {
      if (proposal.type === 'select') {
        return {
          ...proposal,
          options: proposal.options.map((option) => ({ value: option.id, label: option.content })),
        };
      }
      return proposal;
    });
  }
}
