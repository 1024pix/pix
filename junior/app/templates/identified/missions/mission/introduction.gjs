import { PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Bubble from 'junior/components/bubble';
import ChallengeLayout from 'junior/components/challenge/challenge-layout';
import ChallengeMedia from 'junior/components/challenge/content/challenge-media';
import Header from 'junior/components/header';
import RobotDialog from 'junior/components/robot-dialog';
import WidthLimitedContent from 'junior/components/width-limited-content';
<template>
  {{pageTitle (t "pages.missions.introduction-page.title")}}

  <ChallengeLayout>
    <WidthLimitedContent>
      <div class="mission-introduction">
        <Header>
          <RobotDialog>
            <Bubble
              @message={{t "pages.missions.introduction-page.robot-text.0"}}
              @oralization={{@model.learnerHasOralizationFeature}}
            />

            <Bubble
              @message={{t "pages.missions.introduction-page.robot-text.1"}}
              @oralization={{@model.learnerHasOralizationFeature}}
            />
          </RobotDialog>
        </Header>
        <div class="mission-introduction__container">
          <div class="mission-introduction__media">
            <ChallengeMedia
              @src={{@model.mission.introductionMediaUrl}}
              @alt={{@model.mission.introductionMediaAlt}}
              @type={{@model.mission.introductionMediaType}}
            />
          </div>
          <div class="mission-introduction__actions">
            <PixButtonLink @route="identified.missions.mission.resume" size="large" class="details-action">
              <p>{{t "pages.missions.introduction-page.start-mission"}}</p>
              <PixIcon @name="arrowRight" class="button-actions__icon" @ariaHidden={{true}} />
            </PixButtonLink>
          </div>
        </div>
      </div>
    </WidthLimitedContent>
  </ChallengeLayout>
</template>
