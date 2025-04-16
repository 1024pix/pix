import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ModulixFeedback from 'mon-pix/components/module/feedback';

import { htmlUnsafe } from '../../../helpers/html-unsafe';
import ModuleElement from './module-element';

export default class ModuleQcu extends ModuleElement {
  @tracked selectedAnswerId = null;

  @action
  radioClicked(proposalId, event) {
    if (this.disableInput) {
      return;
    }

    this.selectedAnswerId = proposalId;

    if (this.hasLessThanTwoProposals) {
      this.onAnswer(event);
    }
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

  get disableInput() {
    return super.disableInput ? true : null;
  }

  @action
  getProposalState(proposalId) {
    if (!this.correction) {
      return null;
    }

    if (this.selectedAnswerId !== proposalId) {
      return 'neutral';
    }

    return this.correction?.isOk ? 'success' : 'error';
  }

  get hasLessThanTwoProposals() {
    return this.args.element.proposals.length <= 2;
  }

  <template>
    <form class="element-qcu" aria-describedby="instruction-{{this.element.id}}">
      {{#if this.hasLessThanTwoProposals}}
        <div class="element-qcu--short">
          <fieldset class="">
            <legend class="screen-reader-only">
              {{t "pages.modulix.qcu.direction"}}
            </legend>

            <div class="element-qcu__instruction--short" id="instruction-{{this.element.id}}">
              {{htmlUnsafe this.element.instruction}}
            </div>

            <div class="element-qcu__proposals element-qcu__proposals--short">
              {{#each this.element.proposals as |proposal|}}
                <PixButton
                  class="button--short"
                  name={{this.element.id}}
                  @variant="secondary"
                  @value={{proposal.id}}
                  @isDisabled={{this.disableInput}}
                  @state={{this.getProposalState proposal.id}}
                  @triggerAction={{fn this.radioClicked proposal.id}}
                >
                  {{htmlUnsafe proposal.content}}
                </PixButton>
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

          <div class="element-qcu__feedback" role="status" tabindex="-1">
            {{#if this.shouldDisplayFeedback}}
              <ModulixFeedback @answerIsValid={{this.answerIsValid}} @feedback={{this.correction.feedback}} />
            {{/if}}
          </div>
        </div>
      {{else}}
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
            @variant="success"
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
            @variant="secondary"
            @size="small"
            @type="button"
            @triggerAction={{this.retry}}
            @iconAfter="refresh"
          >
            {{t "pages.modulix.buttons.activity.retry"}}
          </PixButton>
        {{/if}}
      {{/if}}
    </form>
  </template>
}
