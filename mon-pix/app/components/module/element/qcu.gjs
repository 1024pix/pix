import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
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

export default class ModuleQcu extends ModuleElement {
  @tracked selectedAnswerId = null;
  @tracked currentCorrection;
  @service passageEvents;
  @service modulixPreviewMode;
  @tracked displayFeedbackState = false;

  @action
  radioClicked(proposalId) {
    if (this.disableInput) {
      return;
    }

    this.selectedAnswerId = proposalId;
  }

  resetAnswers() {
    this.selectedAnswerId = null;
  }

  get canValidateElement() {
    return !!this.selectedAnswerId;
  }

  get userResponse() {
    return [this.selectedAnswerId];
  }

  @action
  getProposalState(proposalId) {
    if (!this.correction) {
      return null;
    }

    if (this.selectedAnswerId !== proposalId || !this.displayFeedbackState) {
      return 'neutral';
    }

    return this.correction?.isOk ? 'success' : 'error';
  }

  get answerIsValid() {
    return this.selectedAnswerId === this.element.solution;
  }

  get correction() {
    if (this.isOnRetryMode) {
      return null;
    }

    if (!this.displayFeedbackState) {
      return undefined;
    }

    return this.currentCorrection;
  }

  get disableInput() {
    return !this.isOnRetryMode && (this.displayFeedbackState || !!this.currentCorrection);
  }

  @action
  isValidFeedbackForPreview(proposalId) {
    return this.element.solution === proposalId;
  }

  @action
  onAnswer(event) {
    super.onAnswer(event);
    if (this.shouldDisplayRequiredMessage === true) {
      return;
    }

    const status = this.answerIsValid ? 'ok' : 'ko';
    this.currentCorrection = {
      status,
      feedback: this.selectedProposalFeedback,
      isOk: this.answerIsValid,
      isKo: !this.answerIsValid,
    };
    this.passageEvents.record({
      type: 'QCU_ANSWERED',
      data: { answer: this.selectedAnswerId, elementId: this.element.id, status },
    });

    return new Promise((resolve, _) => {
      window.setTimeout(() => {
        this.displayFeedbackState = true;
        resolve();
      }, VERIFY_RESPONSE_DELAY);
    });
  }

  @action
  retry(event) {
    super.retry(event);
    this.currentCorrection = null;
    this.displayFeedbackState = false;
  }

  get selectedProposalFeedback() {
    return this.element.proposals.find((proposal) => proposal.id === this.selectedAnswerId).feedback;
  }

  <template>
    <form class="element-qcu" aria-describedby="instruction-{{this.element.id}}">
      <fieldset>
        <legend class="screen-reader-only">
          {{t "pages.modulix.qcu.direction"}}
        </legend>

        <div class="element-qcu__instruction" id="instruction-{{this.element.id}}">
          {{htmlUnsafe this.element.instruction}}
        </div>

        <p class="element-qcu__direction" aria-hidden="true">
          {{t "pages.modulix.qcu.direction"}}
        </p>

        <div class="element-qcu__proposals">
          {{#each this.element.proposals as |proposal|}}
            <PixRadioButton
              name={{this.element.id}}
              @value={{proposal.id}}
              @isDisabled={{this.disableInput}}
              @state={{this.getProposalState proposal.id}}
              @variant="tile"
              {{on "click" (fn this.radioClicked proposal.id)}}
            >
              <:label>
                {{htmlUnsafe proposal.content}}
              </:label>
            </PixRadioButton>

            {{#if this.modulixPreviewMode.isEnabled}}
              <div class="element-qcu__feedback" role="status" tabindex="-1">
                <ModulixFeedback
                  @answerIsValid={{this.isValidFeedbackForPreview proposal.id}}
                  @feedback={{proposal.feedback}}
                />
              </div>
            {{/if}}
          {{/each}}
        </div>
      </fieldset>

      {{#if this.shouldDisplayRequiredMessage}}
        <div class="element-qcu__required-field-missing">
          <PixNotificationAlert role="alert" @type="error" @withIcon={{true}}>
            {{t "pages.modulix.verification-precondition-failed-alert.qcu"}}
          </PixNotificationAlert>
        </div>
      {{/if}}

      {{#unless this.correction}}
        <PixButton
          @variant="primary"
          @type="submit"
          class="element-qcu__verify-button"
          @triggerAction={{this.onAnswer}}
        >
          {{t "pages.modulix.buttons.activity.verify"}}
        </PixButton>
      {{/unless}}

      <div class="element-qcu__feedback" role="status" tabindex="-1">
        {{#if this.shouldDisplayFeedback}}
          <ModulixFeedback @answerIsValid={{this.answerIsValid}} @feedback={{this.correction.feedback}} />
        {{/if}}
      </div>

      {{#if this.shouldDisplayRetryButton}}
        <PixButton
          class="element-qcu__retry-button"
          @variant="tertiary"
          @size="small"
          @type="button"
          @triggerAction={{this.retry}}
          @iconBefore="refresh"
        >
          {{t "pages.modulix.buttons.activity.retry"}}
        </PixButton>
      {{/if}}
    </form>
  </template>
}
