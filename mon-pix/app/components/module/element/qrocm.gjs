import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn, get, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import ModuleElement from 'mon-pix/components/module/element/module-element';
import ModulixFeedback from 'mon-pix/components/module/feedback';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

import { VERIFY_RESPONSE_DELAY } from '../component/element';

export default class ModuleQrocm extends ModuleElement {
  @tracked selectedValues = {};
  @tracked currentCorrection;
  @tracked isVerifying = false;
  @tracked reportInfo = {};
  @service passageEvents;
  @service qrocmSolutionVerification;
  @service modulixPreviewMode;

  constructor() {
    super(...arguments);
  }

  get correction() {
    return this.currentCorrection;
  }

  get canValidateElement() {
    return this.element.proposals
      .filter(({ type }) => ['input', 'select'].includes(type))
      .every(({ input }) => {
        return !!this.selectedValues?.[input];
      });
  }

  get userResponse() {
    return Object.entries(this.selectedValues).map(([input, answer]) => {
      return {
        input,
        answer,
      };
    });
  }

  resetAnswers() {
    this.selectedValues = {};
    this.currentCorrection = null;
  }

  get formattedProposals() {
    return this.element.proposals.map((proposal) => {
      if (proposal.type === 'select') {
        return {
          ...proposal,
          options: proposal.options.map((option) => ({ value: option.id, label: option.content })),
        };
      }
      return proposal;
    });
  }

  get nbOfProposals() {
    return this.element.proposals.filter(({ type }) => type !== 'text').length;
  }

  @action
  onInputChanged(block, { target }) {
    this.#updateSelectedValues(block, target.value);
  }

  @action
  onSelectChanged(block, value) {
    this.#updateSelectedValues(block, value);
  }

  get answerIsValid() {
    const proposalsWithSolution = this.element.proposals.filter(({ type }) => ['input', 'select'].includes(type));
    return this.qrocmSolutionVerification.match({
      userResponses: this.userResponse,
      proposals: proposalsWithSolution,
    });
  }

  @action
  async onAnswer(event) {
    this.isVerifying = true;
    super.onAnswer(event);

    if (this.shouldDisplayRequiredMessage === true) {
      this.isVerifying = false;
      return;
    }

    await this.#waitFor(VERIFY_RESPONSE_DELAY);

    const answerIsValid = this.answerIsValid;
    const status = answerIsValid ? 'ok' : 'ko';

    const answers = this.userResponse.map(({ input, answer }) => `${input}: ${answer}`).join(', ');
    this.reportInfo = {
      answer: answers,
      elementId: this.element.id,
    };

    this.currentCorrection = {
      feedback: answerIsValid ? this.element.feedbacks.valid : this.element.feedbacks.invalid,
      solution: this.element.solutions,
      isOk: answerIsValid,
      isKo: !answerIsValid,
    };

    this.passageEvents.record({
      type: 'QROCM_ANSWERED',
      data: { answer: this.userResponse, elementId: this.element.id, status },
    });

    this.isVerifying = false;
  }

  @action
  retry(event) {
    super.retry(event);

    this.passageEvents.record({
      type: 'QROCM_RETRIED',
      data: { elementId: this.element.id },
    });
  }

  #waitFor(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
  }

  #updateSelectedValues(block, value) {
    this.selectedValues = {
      ...this.selectedValues,
      [block.input]: value,
    };
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

  get disableInput() {
    return super.disableInput || this.isVerifying;
  }

  <template>
    <form
      class="element-qrocm"
      aria-describedby="instruction-{{this.element.id}}"
      autocapitalize="off"
      autocomplete="nope"
      autocorrect="off"
      spellcheck="false"
    >
      <fieldset>
        <legend class="screen-reader-only">
          {{t "pages.modulix.qrocm.direction" count=this.nbOfProposals}}
        </legend>

        <div class="element-qrocm__instruction" id="instruction-{{this.element.id}}">
          {{htmlUnsafe this.element.instruction}}
        </div>

        <p class="element-qrocm__direction" aria-hidden="true">
          {{t "pages.modulix.qrocm.direction" count=this.nbOfProposals}}
        </p>

        <div class="element-qrocm__proposals">
          {{#each this.formattedProposals as |block|}}
            {{#if (eq block.type "text")}}
              {{htmlUnsafe block.content}}
            {{/if}}
            {{#if (eq block.type "input")}}
              <div
                class="element-qrocm-proposals__input
                  {{if (eq block.display 'block') 'element-qrocm-proposals__input--block'}}"
              >
                <PixInput
                  type={{block.inputType}}
                  @value={{get this.selectedValues block.input}}
                  @id={{block.input}}
                  placeholder={{block.placeholder}}
                  @screenReaderOnly={{true}}
                  {{on "change" (fn this.onInputChanged block)}}
                  size={{block.size}}
                  readonly={{this.disableInput}}
                >
                  <:label>{{block.ariaLabel}}</:label>
                </PixInput>
              </div>
            {{else if (eq block.type "select")}}
              <div
                class="element-qrocm-proposals__input
                  {{if (eq block.display 'block') 'element-qrocm-proposals__input--block'}}"
              >
                <PixSelect
                  @value={{get this.selectedValues block.input}}
                  @texts={{hash placeholder=block.placeholder}}
                  @options={{block.options}}
                  @hideDefaultOption={{true}}
                  @onChange={{fn this.onSelectChanged block}}
                  @screenReaderOnly={{true}}
                  @isDisabled={{this.disableInput}}
                >
                  <:label>{{block.ariaLabel}}</:label>
                </PixSelect>
              </div>
            {{/if}}
          {{/each}}
        </div>
      </fieldset>

      {{#if this.shouldDisplayRequiredMessage}}
        <div class="element-qrocm__required-field-missing">
          <PixNotificationAlert role="alert" @type="error" @withIcon={{true}}>
            {{t "pages.modulix.verification-precondition-failed-alert.qrocm"}}
          </PixNotificationAlert>
        </div>
      {{/if}}

      {{#unless this.correction}}
        <PixButton
          @variant="primary"
          @type="submit"
          class="element-qrocm__verify-button"
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
