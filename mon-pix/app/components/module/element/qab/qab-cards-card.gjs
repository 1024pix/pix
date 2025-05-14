import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { eq } from 'ember-truth-helpers';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

export default class ModulixQabCard extends Component {
  @tracked selectedProposalId = null;

  get proposalA() {
    return this.args.card.proposals[0];
  }

  get proposalB() {
    return this.args.card.proposals[1];
  }

  get isProposalASelected() {
    return this.selectedProposalId === this.proposalA.id;
  }

  get isProposalBSelected() {
    return this.selectedProposalId === this.proposalB.id;
  }

  @action
  onSelectProposal(proposalId) {
    this.selectedProposalId = proposalId;
    this.args.onCardFlip(proposalId);
  }

  <template>
    <div
      class="element-qab-cards-card element-qab-cards-card--{{@displayedStateName}}
        element-qab-cards-card--{{@displayedStateName}}--{{@cardResult}}"
    >
      <div class="element-qab-cards-card__content">
        <div class="element-qab-cards-card__text">
          <p class="element-qab-cards-card__text--question">{{htmlUnsafe @card.instruction}}</p>
        </div>
      </div>

      <div class="element-qab-cards-card__footer element-qab-cards-card__footer--{{@displayedStateName}}">
        {{#if (eq @displayedStateName "question")}}
          <button
            type="submit"
            {{on "click" (fn this.onSelectProposal this.proposalA.id)}}
            class="qab-custom-action-button"
          >
            {{this.proposalA.content}}
          </button>
          <button
            type="submit"
            {{on "click" (fn this.onSelectProposal this.proposalB.id)}}
            class="qab-custom-action-button"
          >
            {{this.proposalB.content}}
          </button>
        {{/if}}

        {{#if (eq @displayedStateName "feedback")}}
          <button
            type="submit"
            disabled
            class="qab-custom-action-button qab-custom-action-button--feedback--{{@cardResult}}
              {{if this.isProposalASelected (concat 'qab-custom-action-button--feedback--selected--' @cardResult)}}"
          >
            {{this.proposalA.content}}
          </button>
          <button
            type="submit"
            disabled
            class="qab-custom-action-button qab-custom-action-button--feedback--{{@cardResult}}
              {{if this.isProposalBSelected (concat 'qab-custom-action-button--feedback--selected--' @cardResult)}}"
          >
            {{this.proposalB.content}}
          </button>
        {{/if}}
      </div>
    </div>
  </template>
}
