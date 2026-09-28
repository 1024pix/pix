import { PixButton, PixButtonLink, PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Bubble from 'junior/components/bubble';
import Header from 'junior/components/header';
import MarkdownToHtml from 'junior/components/markdown-to-html';
import MissionCard from 'junior/components/mission-card/mission-card';
import RobotDialog from 'junior/components/robot-dialog';
import WidthLimitedContent from 'junior/components/width-limited-content';
<template>
  {{pageTitle (t "pages.missions.start-page.title")}}
  <WidthLimitedContent>
    <div class="mission-page">
      <Header>
        <RobotDialog>
          <Bubble @message={{t "pages.missions.start-page.welcome"}} />
        </RobotDialog>
      </Header>
      <div class="mission-page__body">

        <MissionCard @title={{@model.name}} @cardImageUrl={{@model.cardImageUrl}} @areaCode={{@model.areaCode}} />

        <div class="mission-page__details">
          <LinkTo @route="identified.missions" class="details-go-back">{{t
              "pages.missions.start-page.back-to-missions"
            }}</LinkTo>
          <p class="details-list__title details-list__title--big">{{t "pages.missions.start-page.purpose-title"}}</p>
          <ul class="details-list">
            {{#each @controller.validatedObjectives as |element|}}
              <li class="details-list--with-bullet">
                <MarkdownToHtml @markdown={{element}} class="details-list__item" />
              </li>
            {{/each}}
          </ul>

          <PixButtonLink
            @route={{@controller.routeUrl}}
            size="large"
            class="details-action"
            {{on "click" @controller.activeLoadingButton}}
          >
            <p>{{t "pages.missions.start-page.start-mission"}}</p>
            <PixIcon @name="arrowRight" class="details-action__icon" @ariaHidden={{true}} />
          </PixButtonLink>

          <PixButton class="details-action details-action__loader" @isLoading="true" @ariaHidden={{true}} />
        </div>
      </div>
    </div>
  </WidthLimitedContent>
</template>
