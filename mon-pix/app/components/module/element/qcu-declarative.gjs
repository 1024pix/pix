import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ProposalButton from 'mon-pix/components/module/component/proposal-button';
import RichContent from 'mon-pix/components/module/rich-content';

import { htmlUnsafe } from '../../../helpers/html-unsafe';
import { VERIFY_RESPONSE_DELAY } from '../component/element';
import ModulixIssueReportBlock from '../issue-report/issue-report-block';
import ModuleElement from './module-element';

export default class ModuleQcuDeclarative extends ModuleElement {
  @tracked selectedProposalId = null;
  @tracked shouldDisplayFeedback = false;
  @tracked reportInfo = {};

  @service passageEvents;
  @service modulixPreviewMode;

  get selectedProposalFeedback() {
    return this.element.proposals.find((proposal) => proposal.id === this.selectedProposalId).feedback.diagnosis;
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
      answer: this.selectedProposalAnswer,
      elementId: this.element.id,
    };

    await this.waitFor(VERIFY_RESPONSE_DELAY);
    await this.args.onAnswer({ element: this.element });

    this.shouldDisplayFeedback = true;
    this.passageEvents.record({
      type: 'QCU_DECLARATIVE_ANSWERED',
      data: {
        elementId: this.element.id,
        answer: this.selectedProposalAnswer,
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
    <form class="element-qcu-declarative" onSubmit={{this.onAnswer}} aria-describedby="instruction-{{this.element.id}}">
      <fieldset>
        <legend class="screen-reader-only">
          {{t "pages.modulix.qcuDeclarative.direction"}}
        </legend>
        <p class="element-qcu-declarative__instruction" id="instruction-{{this.element.id}}">
          <RichContent @html={{this.element.instruction}} />
        </p>
        <p class="element-qcu-declarative__complementary-instruction">
          {{t "pages.modulix.qcuDeclarative.complementaryInstruction"}}
        </p>
        <div class="element-qcu-declarative__{{this.proposalsStyle}}">
          {{#each this.element.proposals as |proposal|}}
            <ProposalButton
              @proposal={{proposal}}
              @isDisabled={{this.isAnswered}}
              @isSelected={{this.isProposalSelected proposal.id}}
            />
            {{#if this.modulixPreviewMode.isEnabled}}
              <div class="element-qcu-declarative__feedback" role="status" tabindex="-1">
                <div class="element-qcu-declarative-feedback__content">
                  {{htmlUnsafe proposal.feedback.diagnosis}}
                </div>
              </div>
            {{/if}}
          {{/each}}
        </div>
      </fieldset>
    </form>
    {{#if this.shouldDisplayFeedback}}
      <div class="element-qcu-declarative__feedback" role="status" tabindex="-1">
        <div class="element-qcu-declarative-feedback__content">
          {{htmlUnsafe this.selectedProposalFeedback}}
        </div>
        <div class="element-qcu-declarative-feedback__report-button">
          <ModulixIssueReportBlock @reportInfo={{this.reportInfo}} />
        </div>
      </div>
    {{/if}}
  </template>
}
