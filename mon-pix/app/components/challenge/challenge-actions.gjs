import { PixButton, PixNotificationAlert } from '@1024pix/nebulix-ember';
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

  get hasCurrentOngoingLiveAlert() {
    return this.args.hasOngoingCompanionLiveAlert || this.args.hasOngoingChallengeLiveAlert;
  }

  get displayChallengeTimeout() {
    return this.args.hasChallengeTimedOut || this.args.answer?.result === 'timedout';
  }

  @action
  async handleSkipAction() {
    await this.args.skipChallenge();
  }

  <template>
    <div class="challenge-actions">
      <h2 class="sr-only">{{t "pages.challenge.parts.validation"}}</h2>

      {{#if this.displayChallengeTimeout}}
        <PixNotificationAlert @type="warning" @withIcon="true">
          {{t "pages.challenge.timed.cannot-answer"}}
        </PixNotificationAlert>
      {{/if}}

      {{#if @answer}}
        <PixNotificationAlert @type="info" @withIcon="true">
          {{t "pages.challenge.already-answered"}}
        </PixNotificationAlert>

        <PixButton
          @triggerAction={{fn @resumeAssessment @assessment}}
          @variant="primary"
          class="challenge-actions__action-continue"
        >
          {{t "pages.challenge.actions.continue"}}
        </PixButton>

      {{else if @hasChallengeTimedOut}}
        <PixButton
          @type="submit"
          @variant="primary"
          class="challenge-actions__action-continue"
          aria-label={{t "pages.challenge.actions.continue-go-to-next"}}
        >
          {{t "pages.challenge.actions.continue"}}
        </PixButton>
      {{else}}
        {{#if this.hasCurrentOngoingLiveAlert}}
          <PixNotificationAlert @type="error" @withIcon="true">
            {{t "pages.challenge.actions.wait-for-invigilator"}}
          </PixNotificationAlert>
        {{/if}}

        <div class="challenge-actions__group">
          <PixButton
            @variant="secondary"
            @triggerAction={{this.handleSkipAction}}
            @isLoading={{@isSkipActionLoading}}
            @loadingColor="grey"
            @isDisabled={{or this.areActionButtonsDisabled @isValidateActionLoading}}
            aria-label={{t "pages.challenge.actions.skip-go-to-next"}}
          >
            {{t "pages.challenge.actions.skip"}}
          </PixButton>

          <PixButton
            @variant="primary"
            @type="submit"
            @isLoading={{@isValidateActionLoading}}
            @isDisabled={{or this.areActionButtonsDisabled @isSkipActionLoading}}
            @iconAfter="arrowRight"
            aria-label={{t "pages.challenge.actions.validate-go-to-next"}}
          >
            {{t "pages.challenge.actions.validate"}}
          </PixButton>
        </div>
      {{/if}}
    </div>
  </template>
}
