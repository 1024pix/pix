import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ProposalButton from 'mon-pix/components/module/component/proposal-button';
import ModulixFeedback from 'mon-pix/components/module/feedback';
import RichContent from 'mon-pix/components/module/rich-content';

import { VERIFY_RESPONSE_DELAY } from '../component/element';
import ModuleElement from './module-element';

export default class ModuleQcuDiscovery extends ModuleElement {
  @tracked selectedProposalId = null;
  @tracked shouldDisplayFeedback = false;
  @tracked reportInfo = {};

  @service passageEvents;
  @service modulixPreviewMode;

  get selectedProposalFeedback() {
    return this.element.proposals.find((proposal) => proposal.id === this.selectedProposalId).feedback;
  }

  get selectedProposalAnswer() {
    return this.element.proposals.find((proposal) => proposal.id === this.selectedProposalId).content;
  }

  @action
  isProposalSelected(proposalId) {
    return this.selectedProposalId === proposalId;
  }

  @action
  async onAnswer(event) {
    event.preventDefault();
    this.selectedProposalId = event.submitter.value;
    this.reportInfo = {
      answer: this.selectedProposalId,
      elementId: this.element.id,
    };

    await this.waitFor(VERIFY_RESPONSE_DELAY);
    await this.args.onAnswer({ element: this.element });

    this.shouldDisplayFeedback = true;
    this.passageEvents.record({
      type: 'QCU_DISCOVERY_ANSWERED',
      data: {
        elementId: this.element.id,
        answer: this.selectedProposalId,
        status: this.selectedProposalId === this.element.solution ? 'ok' : 'ko',
      },
    });
  }

  get isAnswered() {
    return this.selectedProposalId !== null;
  }

  waitFor(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  <template>
    <form class="element-qcu-discovery" onSubmit={{this.onAnswer}} aria-describedby="instruction-{{this.element.id}}">
      <fieldset>
        <legend class="screen-reader-only">
          {{t "pages.modulix.qcuDiscovery.direction"}}
        </legend>
        <p class="element-qcu-discovery__instruction" id="instruction-{{this.element.id}}">
          <RichContent @html={{this.element.instruction}} />
        </p>
        <p class="element-qcu-discovery__direction">
          {{t "pages.modulix.qcuDiscovery.direction"}}
        </p>
        <div class="element-qcu-discovery__{{this.proposalsStyle}}">
          {{#each this.element.proposals as |proposal|}}
            <ProposalButton
              @proposal={{proposal}}
              @isDisabled={{this.isAnswered}}
              @isSelected={{this.isProposalSelected proposal.id}}
              @isDiscoveryVariant={{true}}
            />
            {{#if this.modulixPreviewMode.isEnabled}}
              <ModulixFeedback @feedback={{proposal.feedback}} />
            {{/if}}
          {{/each}}
        </div>
      </fieldset>
    </form>

    {{#if this.shouldDisplayFeedback}}
      <ModulixFeedback @feedback={{this.selectedProposalFeedback}} @reportInfo={{this.reportInfo}} />
    {{/if}}
  </template>
}
