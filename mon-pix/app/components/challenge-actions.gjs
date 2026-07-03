import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';

export default class ChallengeActions extends Component {
  get areActionButtonsDisabled() {
    return this.args.disabled || this.hasCurrentOngoingLiveAlert;
  }

  get isNotCertification() {
    return !this.args.isCertification;
  }

  get isV2Certification() {
    return this.args.certificationVersion === 2;
  }

  get isV3CertificationAdjustedForAccessibility() {
    return this.args.certificationVersion === 3 && this.args.isAdjustedCourseForAccessibility;
  }

  get isV3CertificationNotAdjusted() {
    return this.args.certificationVersion === 3 && !this.args.isAdjustedCourseForAccessibility;
  }

  get hasCurrentOngoingLiveAlert() {
    return this.args.hasOngoingCompanionLiveAlert || this.args.hasOngoingChallengeLiveAlert;
  }

  @action
  async handleValidateAction(event) {
    await this.args.validateAnswer(event);
  }

  @action
  async handleSkipAction() {
    await this.args.skipChallenge();
  }

  <template>
    <div class="rounded-panel__row challenge-actions">
      <h2 class="sr-only">{{t "pages.challenge.parts.validation"}}</h2>

      {{#if @answer}}
        <PixNotificationAlert class="challenge-actions__already-answered" @withIcon="true">
          {{#if (eq @answer.result "timedout")}}
            {{t "pages.challenge.timed.cannot-answer"}}
          {{else}}
            {{t "pages.challenge.already-answered"}}
          {{/if}}
        </PixNotificationAlert>
        <PixButton
          @triggerAction={{fn @resumeAssessment @assessment}}
          @variant="primary"
          class="challenge-actions__action-continue"
        >
          {{t "pages.challenge.actions.continue"}}
        </PixButton>

      {{else if @hasChallengeTimedOut}}
        <div class="challenge-actions__alert-message" role="alert" aria-live="assertive">
          <PixIcon
            @name="info"
            @plainIcon={{true}}
            @ariaHidden={{true}}
            class="challenge-actions-alert-message__icon"
          />
          {{t "pages.challenge.timed.cannot-answer"}}
        </div>
        <PixButton
          @triggerAction={{@validateAnswer}}
          @variant="primary"
          class="challenge-actions__action-continue"
          aria-label={{t "pages.challenge.actions.continue-go-to-next"}}
        >
          {{t "pages.challenge.actions.continue"}}
        </PixButton>

      {{else}}
        {{#if @hasFocusedOutOfWindow}}
          <div
            class="challenge-actions__alert-message"
            data-test="alert-message-focused-out-of-window"
            role="alert"
            aria-live="assertive"
          >
            <PixIcon
              @name="info"
              @plainIcon={{true}}
              @ariaHidden={{true}}
              class="challenge-actions-alert-message__icon"
            />
            {{#if this.isNotCertification}}
              <span data-test="default-focused-out-error-message">{{t
                  "pages.challenge.has-focused-out-of-window.default"
                }}</span>
            {{/if}}

            {{#if this.isV2Certification}}
              <span data-test="certification-focused-out-error-message">{{t
                  "pages.challenge.has-focused-out-of-window.certification"
                }}</span>
            {{/if}}

            {{#if this.isV3CertificationAdjustedForAccessibility}}
              <span data-test="certification-v3-focused-out-error-message">{{t
                  "pages.challenge.has-focused-out-of-window.v3-accessible-certification"
                }}</span>
            {{/if}}

            {{#if this.isV3CertificationNotAdjusted}}
              <span data-test="certification-v3-focused-out-error-message">{{t
                  "pages.challenge.has-focused-out-of-window.v3-certification"
                }}</span>
            {{/if}}
          </div>
        {{/if}}

        <div class="challenge-actions__group">
          <div class="challenge-actions__buttons">
            <PixButton
              @variant="success"
              @triggerAction={{this.handleValidateAction}}
              @isLoading={{@isValidateActionLoading}}
              @isDisabled={{or this.areActionButtonsDisabled @isSkipActionLoading}}
              @iconAfter="arrowRight"
              class="challenge-actions__action-validate"
              aria-label={{t "pages.challenge.actions.validate-go-to-next"}}
            >
              {{t "pages.challenge.actions.validate"}}
            </PixButton>

            <PixButton
              @variant="secondary"
              @triggerAction={{this.handleSkipAction}}
              @isLoading={{@isSkipActionLoading}}
              @loadingColor="grey"
              @isDisabled={{or this.areActionButtonsDisabled @isValidateActionLoading}}
              class="challenge-actions__action-skip"
              aria-label={{t "pages.challenge.actions.skip-go-to-next"}}
            >
              {{t "pages.challenge.actions.skip"}}
            </PixButton>
          </div>
          {{#if this.hasCurrentOngoingLiveAlert}}
            <p>{{t "pages.challenge.actions.wait-for-invigilator"}}</p>
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}
