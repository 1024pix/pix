import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ModulixFeedback from 'mon-pix/components/module/feedback';

import { htmlUnsafe } from '../../../helpers/html-unsafe';
import { VERIFY_RESPONSE_DELAY } from '../component/element';
import ModuleElement from './module-element';

export default class ModuleQcm extends ModuleElement {
  @service passageEvents;
  @service modulixPreviewMode;

  @tracked isAnswering = false;
  @tracked currentCorrection;
  @tracked answerIsValid = false;
  @tracked reportInfo = {};

  selectedAnswerIds = new Set();

  get canValidateElement() {
    return this.selectedAnswerIds.size >= 2;
  }

  get userResponse() {
    return [...this.selectedAnswerIds];
  }

  get disableInput() {
    return super.disableInput || this.isAnswering;
  }

  validAnswer() {
    const solutions = new Set(this.element.solutions);
    const answers = this.selectedAnswerIds;
    this.answerIsValid = solutions.size === answers.size && [...solutions].every((solution) => answers.has(solution));
  }

  get correction() {
    if (this.isOnRetryMode) {
      return null;
    }
    return this.currentCorrection;
  }

  resetAnswers() {
    this.currentCorrection = null;
    this.selectedAnswerIds = new Set();
  }

  @action
  checkboxSelected(proposalId) {
    if (this.selectedAnswerIds.has(proposalId)) {
      this.selectedAnswerIds.delete(proposalId);
    } else {
      this.selectedAnswerIds.add(proposalId);
    }
  }

  @action
  getProposalState(proposalId) {
    if (!this.correction) {
      return null;
    }

    if (!this.selectedAnswerIds.has(proposalId)) {
      return 'neutral';
    }

    return this.correction.solution.includes(proposalId) ? 'success' : 'error';
  }

  @action
  async onAnswer(event) {
    event.preventDefault();
    this.args.updateSkipButton(true);
    this.isAnswering = true;
    super.onAnswer(event);

    await this.waitFor(VERIFY_RESPONSE_DELAY);

    if (this.shouldDisplayRequiredMessage === true) {
      this.isAnswering = false;
      this.args.updateSkipButton(false);
      return;
    }
    this.validAnswer();
    const status = this.answerIsValid ? 'ok' : 'ko';
    const answers = this.userResponse.join(', ');
    this.reportInfo = {
      answer: answers,
      elementId: this.element.id,
    };

    this.currentCorrection = {
      status,
      feedback: this.answerIsValid ? this.element.feedbacks.valid : this.element.feedbacks.invalid,
      solution: this.element.solutions,
      isOk: this.answerIsValid,
      isKo: !this.answerIsValid,
    };

    this.args.updateSkipButton(false);
    this.isAnswering = false;

    this.passageEvents.record({
      type: 'QCM_ANSWERED',
      data: { answer: this.userResponse, elementId: this.element.id, status },
    });
  }

  @action
  retry(event) {
    super.retry(event);

    this.passageEvents.record({
      type: 'QCM_RETRIED',
      data: { elementId: this.element.id },
    });
  }

  waitFor(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  get previewFeedbacks() {
    const feedbacks = [];
    for (const [key, value] of Object.entries(this.element.feedbacks)) {
      feedbacks.push({ status: key, ...value });
    }
    return feedbacks;
  }

  isValidFeedbackForPreview(feedback) {
    return feedback.status === 'valid';
  }

  <template>
    <form class="element-qcm" aria-describedby="instruction-{{this.element.id}}">
      <fieldset>
        <legend class="screen-reader-only">
          {{t "pages.modulix.qcm.direction"}}
        </legend>

        <div class="element-qcm__instruction" id="instruction-{{this.element.id}}">
          {{htmlUnsafe this.element.instruction}}
        </div>

        <p class="element-qcm__direction" aria-hidden="true">
          {{t "pages.modulix.qcm.direction"}}
        </p>

        <div class="element-qcm__{{this.proposalsStyle}}">
          {{#each this.element.proposals as |proposal|}}
            <PixCheckbox
              name={{this.element.id}}
              @isDisabled={{this.disableInput}}
              @state={{this.getProposalState proposal.id}}
              @variant="modulix"
              {{on "click" (fn this.checkboxSelected proposal.id)}}
            >
              <:label>{{htmlUnsafe proposal.content}}</:label>
            </PixCheckbox>
          {{/each}}
        </div>
      </fieldset>

      {{#if this.shouldDisplayRequiredMessage}}
        <div class="element-qcm__required-field-missing">
          <PixNotificationAlert role="alert" @type="error" @withIcon={{true}}>
            {{t "pages.modulix.verification-precondition-failed-alert.qcm"}}
          </PixNotificationAlert>
        </div>
      {{/if}}

      {{#unless this.correction}}
        <PixButton
          @variant="primary"
          @type="submit"
          class="element-qcm__verify-button"
          @triggerAction={{this.onAnswer}}
        >
          {{t "pages.modulix.buttons.activity.verify"}}
        </PixButton>
      {{/unless}}

      {{#if this.shouldDisplayFeedback}}
        <ModulixFeedback
          @answerIsValid={{this.answerIsValid}}
          @feedback={{this.correction.feedback}}
          @reportInfo={{this.reportInfo}}
          @shouldDisplayRetryButton={{this.shouldDisplayRetryButton}}
          @retry={{this.retry}}
        />
      {{/if}}

      {{#if this.modulixPreviewMode.isEnabled}}
        {{#each this.previewFeedbacks as |feedback|}}
          <ModulixFeedback @answerIsValid={{this.isValidFeedbackForPreview feedback}} @feedback={{feedback}} />
        {{/each}}
      {{/if}}
    </form>
  </template>
}
