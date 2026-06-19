import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { trackedSet } from '@ember/reactive/collections';
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

  selectedProposalIds = trackedSet();
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

  get userResponse() {
    return [...this.selectedProposalIds];
  }

  get canValidateElement() {
    return this.selectedProposalIds.size > 0;
  }

  @action
  checkboxSelected(proposalId) {
    if (this.disableInput) return;
    if (this.selectedProposalIds.has(proposalId)) {
      this.selectedProposalIds.delete(proposalId);
    } else {
      this.selectedProposalIds.add(proposalId);
    }
  }

  @action
  async onAnswer(event) {
    event.preventDefault();
    super.onAnswer(event);

    if (this.shouldDisplayRequiredMessage === true) {
      return;
    }

    this.isAnswering = true;
    const answer = [...this.selectedProposalIds];

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
        answer: answer.join(', '),
      },
    });
  }

  @action
  getProposalState(proposalId) {
    if (this.selectedProposalIds.has(proposalId)) {
      return 'declarative-selected';
    }
    return 'declarative';
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
              name={{proposal.id}}
              @isDisabled={{this.disableInput}}
              @variant="modulix"
              @state={{this.getProposalState proposal.id}}
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
        {{#if this.shouldDisplayRequiredMessage}}
          <div class="element-qcm-declarative__required-field-missing">
            <PixNotificationAlert role="alert" @type="error" @withIcon={{true}}>
              {{t "pages.modulix.verification-precondition-failed-alert.qcm-declarative"}}
            </PixNotificationAlert>
          </div>
        {{/if}}
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
