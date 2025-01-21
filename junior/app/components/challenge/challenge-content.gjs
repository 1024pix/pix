import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { or } from 'ember-truth-helpers';

import CardWrapper from '../card-wrapper';
import AutoReply from './content/auto-reply';
import ChallengeActions from './content/challenge-actions';
import ChallengeMedia from './content/challenge-media';
import EmbeddedSimulator from './content/embedded-simulator';
import EmbeddedWebComponent from './content/embedded-web-component';
import Qcm from './content/qcm';
import Qcu from './content/qcu';
import Qrocm from './content/qrocm';

export default class ChallengeContent extends Component {
  @tracked isRebootable = false;

  constructor() {
    super(...arguments);
    window.addEventListener('message', ({ data }) => {
      if (data?.from === 'pix' && data?.type === 'init') {
        this.isRebootable = !!data.rebootable;
      }
    });
  }

  get shouldDisplayMultipleElements() {
    const challenge = this.args.challenge;
    const hasMediaAndForm = challenge.hasForm && challenge.hasMedia && challenge.hasType;
    const hasIllustrationAndEmbed = challenge.illustrationUrl && challenge.hasEmbed;
    const hasIllustrationAndWebComponent = challenge.illustrationUrl && challenge.hasWebComponent;
    const hasFormAndEmbed = challenge.hasForm && challenge.hasEmbed;

    return hasMediaAndForm || hasIllustrationAndEmbed || hasIllustrationAndWebComponent || hasFormAndEmbed;
  }

  get challengeContentClassname() {
    const hasIllustrationAndEmbed = this.args.challenge.illustrationUrl && this.args.challenge.hasEmbed;
    const hasEmbedAndForm = this.args.challenge.hasEmbed && this.args.challenge.hasForm;
    let classname = '';

    if (this.shouldDisplayMultipleElements) {
      classname = 'challenge-content__grid-multiple-element';

      if (hasIllustrationAndEmbed) {
        classname += ' challenge-content__grid-multiple-element--40-60';
      }

      if (hasEmbedAndForm) {
        classname += ' challenge-content__grid-multiple-element--60-40';
      }
    }
    return classname;
  }

  get shouldDisplayRebootButton() {
    return this.isRebootable && !this.args.isDisabled;
  }

  <template>
    <div class="challenge-content {{this.challengeContentClassname}}">
      {{#if @challenge.illustrationUrl}}
        <CardWrapper>
          <ChallengeMedia @src={{@challenge.illustrationUrl}} @alt={{@challenge.illustrationAlt}} />
        </CardWrapper>
      {{/if}}
      {{#if @challenge.hasEmbed}}
        <CardWrapper>
          <EmbeddedSimulator
            @url={{@challenge.embedUrl}}
            @title={{@challenge.embedTitle}}
            @height={{@challenge.embedHeight}}
            @hideSimulator={{@isDisabled}}
            @isMediaWithForm={{this.isMediaWithForm}}
            @shouldDisplayRebootButton={{this.shouldDisplayRebootButton}}
          />
        </CardWrapper>
      {{/if}}
      {{#if @challenge.hasWebComponent}}
        <EmbeddedWebComponent
          @tagName={{@challenge.webComponentTagName}}
          @props={{@challenge.webComponentProps}}
          @setAnswerValue={{@setAnswerValue}}
        />
      {{/if}}
      {{#if @challenge.hasForm}}
        <div class="challenge-content__form">
          {{#if (or @challenge.isQROC @challenge.isQROCM)}}
            <Qrocm @challenge={{@challenge}} @setAnswerValue={{@setAnswerValue}} @isDisabled={{@isDisabled}} />
          {{else if @challenge.isQCU}}
            <Qcu
              @challenge={{@challenge}}
              @setAnswerValue={{@setAnswerValue}}
              @assessment={{@assessment}}
              @isDisabled={{@isDisabled}}
            />
          {{else if @challenge.isQCM}}
            <Qcm
              @challenge={{@challenge}}
              @setAnswerValue={{@setAnswerValue}}
              @setValidationWarning={{@setValidationWarning}}
              @assessment={{@assessment}}
              @isDisabled={{@isDisabled}}
            />
          {{/if}}
        </div>
      {{/if}}
      {{#if @challenge.autoReply}}
        <div class="challenge-content__autoreply">
          <AutoReply @setAnswerValue={{@setAnswerValue}} />
        </div>
      {{/if}}
      <ChallengeActions
        @validateAnswer={{@validateAnswer}}
        @skipChallenge={{@skipChallenge}}
        @level={{@activity.level}}
        @nextAction={{@resume}}
        @isLesson={{@challenge.isLesson}}
        @disableCheckButton={{@disableCheckButton}}
        @disableLessonButton={{@disableLessonButton}}
        @answerHasBeenValidated={{@answerHasBeenValidated}}
      />
    </div>
  </template>
}
