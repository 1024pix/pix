import PixButton from '@1024pix/pix-ui/components/pix-button';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { or } from 'ember-truth-helpers';

export default class ChallengeActions extends Component {
  get hideSkipButton() {
    return this.args.level === 'TUTORIAL' || this.args.answerHasBeenValidated;
  }

  <template>
    <div class="challenge-actions">
      {{log @isEmbedAutoValidated}}
      {{#unless (or this.hideSkipButton @isLesson)}}
        <PixButton
          class="pix1d-button pix1d-button--skip"
          @triggerAction={{@skipChallenge}}
          @shape="rounded"
          @size="large"
        >
          <span>
            {{t "pages.challenge.actions.skip"}}
          </span>
        </PixButton>
      {{/unless}}
      {{#if @isEmbedAutoValidated}}
      <PixButton
        class="pix1d-button"
        @iconAfter="arrowRight"
        @isDisabled={{@shouldDisableVerifyButton}}
        @triggerAction={{@nextAction}}
        @size="large"
      >
        <span>
          {{'waowwowowo'}}
        </span>
      </PixButton>
      {{else if @answerHasBeenValidated}}
        <PixButton
          class="pix1d-button pix1d-button--success"
          @iconAfter="arrowRight"
          @triggerAction={{@nextAction}}
          @size="large"
        >
          <span>
            {{t "pages.challenge.actions.continue"}}
          </span>
        </PixButton>
      {{else if @isLesson}}
        <PixButton
          class="pix1d-button"
          @iconAfter="arrowRight"
          @isDisabled={{@disableLessonButton}}
          @triggerAction={{@skipChallenge}}
          @size="large"
        >
          <span>
            {{t "pages.challenge.actions.continue"}}
          </span>
        </PixButton>
      {{else}}
        <PixButton
          class="pix1d-button"
          @isDisabled={{@disableCheckButton}}
          @triggerAction={{@validateAnswer}}
          @size="large"
        >
          <span>
            {{t "pages.challenge.actions.check"}}
          </span>
        </PixButton>
      {{/if}}
    </div>
  </template>
}
