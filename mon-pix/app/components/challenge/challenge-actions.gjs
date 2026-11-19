import { PixButton, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
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
      <h2 class="sr-only">{{t "components.challenge-actions.title"}}</h2>

      {{#if this.displayChallengeTimeout}}
        <PixNotificationAlert @type="warning" @withIcon="true">
          {{t "components.challenge-actions.notifications.cannot-answer"}}
        </PixNotificationAlert>
      {{/if}}

      {{#if @answer}}
        <PixNotificationAlert @type="info" @withIcon="true">
          {{t "components.challenge-actions.notifications.already-answered"}}
        </PixNotificationAlert>

        <PixButton
          @triggerAction={{fn @resumeAssessment @assessment}}
          @variant="primary"
          class="challenge-actions__action-continue"
        >
          {{t "components.challenge-actions.actions.continue"}}
        </PixButton>

      {{else if @hasChallengeTimedOut}}
        <PixButton
          @type="submit"
          @variant="primary"
          class="challenge-actions__action-continue"
          aria-label={{t "components.challenge-actions.actions.continue-go-to-next"}}
        >
          {{t "components.challenge-actions.actions.continue"}}
        </PixButton>
      {{else}}
        {{#if this.hasCurrentOngoingLiveAlert}}
          <PixNotificationAlert @type="error" @withIcon="true">
            {{t "components.challenge-actions.notifications.wait-for-invigilator"}}
          </PixNotificationAlert>
        {{/if}}

        <div class="challenge-actions__group">
          <PixButton
            @variant="secondary"
            @triggerAction={{this.handleSkipAction}}
            @isLoading={{@isSkipActionLoading}}
            @loadingColor="grey"
            @isDisabled={{or this.areActionButtonsDisabled @isValidateActionLoading}}
            aria-label={{t "components.challenge-actions.actions.skip-go-to-next"}}
          >
            {{t "components.challenge-actions.actions.skip"}}
          </PixButton>

          <PixButton
            @variant="primary"
            @type="submit"
            @isLoading={{@isValidateActionLoading}}
            @isDisabled={{or this.areActionButtonsDisabled @isSkipActionLoading}}
            @iconAfter="arrowRight"
            aria-label={{t "components.challenge-actions.actions.validate-go-to-next"}}
          >
            {{t "components.challenge-actions.actions.validate"}}
          </PixButton>
        </div>
      {{/if}}
    </div>
  </template>
}
