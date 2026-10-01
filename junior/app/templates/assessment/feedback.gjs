import { PixButton } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Bubble from 'junior/components/bubble';
import ChallengeLayout from 'junior/components/challenge/challenge-layout';
import RobotDialog from 'junior/components/robot-dialog';
<template>
  {{pageTitle (t "pages.missions.feedback.title")}}
  <ChallengeLayout @color="{{@controller.feedbackClassName}}">

    <div class="feedback">
      <div class="robot-container">

        <RobotDialog @class={{@controller.robotMood}} @robotOffSet={{120}}>
          {{#each @controller.robotFeedBackMessage as |message|}}
            <Bubble @message={{message}} />
          {{/each}}

        </RobotDialog>
        <PixButton
          @variant={{@controller.backHomeButtonVariant}}
          class="issue-button"
          @size="large"
          @triggerAction={{@controller.routeUrl}}
        >{{@controller.buttonLabel}}</PixButton>
      </div>

    </div>
  </ChallengeLayout>
</template>
