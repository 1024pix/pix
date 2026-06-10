import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { htmlUnsafe } from '../../../helpers/html-unsafe';
import { VERIFY_RESPONSE_DELAY } from '../component/element';
import ModulixIssueReportBlock from '../issue-report/issue-report-block';
import ModuleElement from './module-element';

export default class ModuleQcmDeclarative extends ModuleElement {
  @service modulixPreviewMode;
  @service passageEvents;

  @tracked selectedProposalIds = new Set();
  @tracked shouldDisplayFeedback = false;
  @tracked reportInfo = {};
  @tracked isAnswering = false;
  @tracked isSubmitted = false;

  get feedback() {
    return this.element.feedback.diagnosis;
  }

  get disableInput() {
    return this.isSubmitted || this.isAnswering;
  }

  get canValidateElement() {
    return false;
  }

  @action
  checkboxSelected(proposalId) {
    if (this.selectedProposalIds.has(proposalId)) {
      this.selectedProposalIds.delete(proposalId);
    } else {
      this.selectedProposalIds.add(proposalId);
    }
  }

  @action
  async onAnswer(event) {
    event.preventDefault();
    this.isAnswering = true;
    const answer = [...this.selectedProposalIds];
    super.onAnswer(event);

    await this.waitFor(VERIFY_RESPONSE_DELAY);
    await this.args.onAnswer({ element: this.element });
    this.reportInfo = {
      answer: answer.join(', '),
      elementId: this.element.id,
    };

    this.isSubmitted = true;
    this.shouldDisplayFeedback = true;
    this.passageEvents.record({
      type: 'QCM_DECLARATIVE_ANSWERED',
      data: {
        elementId: this.element.id,
        answer,
      },
    });
  }

  waitFor(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  <template>
    <form class="element-qcm-declarative" onSubmit={{this.onAnswer}} aria-describedby="instruction-{{this.element.id}}">
      <fieldset>
        <legend class="screen-reader-only">
          {{t "pages.modulix.qcmDeclarative.direction"}}
        </legend>
        <p class="element-qcm-declarative__instruction" id="instruction-{{this.element.id}}">
          {{htmlUnsafe this.element.instruction}}
        </p>
        <p class="element-qcm-declarative__complementary-instruction">
          {{t "pages.modulix.qcmDeclarative.complementaryInstruction"}}
        </p>
        <div role="region" class="element-qcm-declarative__{{this.proposalsStyle}}">
          {{#each this.element.proposals as |proposal|}}
            <PixCheckbox
              name={{this.proposal.id}}
              @isDisabled={{this.disableInput}}
              @variant="modulix"
              {{on "click" (fn this.checkboxSelected proposal.id)}}
            >
              <:label>{{htmlUnsafe proposal.content}}</:label>
            </PixCheckbox>
          {{/each}}
          {{#if this.modulixPreviewMode.isEnabled}}
            <div class="element-qcm-declarative__feedback" role="status" tabindex="-1">
              <div class="element-qcm-declarative-feedback__content">
                {{htmlUnsafe this.element.feedback.diagnosis}}
              </div>
            </div>
          {{/if}}
        </div>
        {{#unless this.isSubmitted}}
          <PixButton class="element-qcm-declarative--submit" @triggerAction={{this.onAnswer}}>{{t
              "pages.modulix.buttons.activity.submit"
            }}</PixButton>
        {{/unless}}
      </fieldset>
    </form>
    {{#if this.shouldDisplayFeedback}}
      <div class="element-qcm-declarative__feedback" role="status" tabindex="-1">
        <div class="element-qcm-declarative-feedback__content">
          {{htmlUnsafe this.feedback}}
        </div>
        <div class="element-qcm-declarative-feedback__report-button">
          <ModulixIssueReportBlock @reportInfo={{this.reportInfo}} />
        </div>
      </div>
    {{/if}}
  </template>
}
