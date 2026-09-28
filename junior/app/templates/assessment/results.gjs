import { PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Bubble from 'junior/components/bubble';
import ChallengeLayout from 'junior/components/challenge/challenge-layout';
import Header from 'junior/components/header';
import MarkdownToHtml from 'junior/components/markdown-to-html';
import CompletedMissionCard from 'junior/components/mission-card/completed-mission-card';
import RobotDialog from 'junior/components/robot-dialog';
import WidthLimitedContent from 'junior/components/width-limited-content';
<template>
  {{pageTitle (t "pages.missions.end-page.title")}}
  <ChallengeLayout @color="{{@controller.feedbackClassName}}">
    <WidthLimitedContent>
      <div class="mission-page">
        <Header>
          <RobotDialog @class={{@controller.robotMood}}>
            {{#each @controller.robotFeedBackMessage as |message|}}
              <Bubble @message={{message}} />
            {{/each}}
          </RobotDialog>
        </Header>
        <div class="mission-page__body">
          <CompletedMissionCard
            @missionLabelStatus={{t "pages.missions.list.status.completed.label"}}
            @title={{@model.mission.name}}
            @areaCode={{@model.mission.areaCode}}
          />

          <div class="mission-page__details">
            <p class="details-list__title details-list__title--big">{{t @controller.resultsTitle}}</p>
            <ul class="details-list">
              {{#each @controller.validatedObjectives as |element index|}}

                <li class="details-list--with-image">
                  {{#if (@controller.isStepSuccessFul index)}}
                    <img src="/images/icons/valid.svg" alt="Valid" />
                  {{else}}
                    <img src="/images/icons/not-valid.svg" alt="Invalid" />
                  {{/if}}
                  <MarkdownToHtml @markdown="{{element}}" class="details-list__item" />
                </li>
              {{/each}}
            </ul>

            <PixButtonLink @route="identified.missions" class="details-action">
              <p>{{t "pages.missions.end-page.back-to-missions"}}</p>
              <PixIcon @name="arrowRight" class="details-action__icon" @ariaHidden={{true}} />
            </PixButtonLink>

          </div>
        </div>
      </div>
    </WidthLimitedContent>
  </ChallengeLayout>
</template>
