import { PixBlock } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import HexagonScore from 'mon-pix/components/hexagon-score';
import ProfileScorecards from 'mon-pix/components/profile-scorecards';
<template>
  {{pageTitle (t "pages.profile-already-shared.title")}}

  <div class="background-banner-wrapper">
    <div class="background-banner"></div>
    <PixBlock @shadow="heavy" class="send-profile-header">
      <div class="send-profile-header__announcement">
        {{#unless @controller.model.sharedProfile.canRetry}}
          <img
            class="send-profile-header__image"
            src="/images/illustrations/fat-bee.svg"
            alt={{t "pages.profile-already-shared.first-title"}}
          />
        {{/unless}}
        <p class="send-profile-header__instruction">
          {{t
            "pages.profile-already-shared.explanation"
            organization=@controller.model.campaign.organizationName
            date=(dayjsFormat @controller.model.sharedProfile.sharedAt "D MMMM YYYY")
            hour=@controller.model.sharedProfile.sharedAt
            htmlSafe=true
          }}
        </p>
        <LinkTo @route="authenticated" class="skill-review-share__back-to-home link">
          {{t "pages.profile-already-shared.actions.continue"}}
        </LinkTo>
      </div>
      {{#if @controller.model.sharedProfile.canRetry}}
        <div class="profile-already-shared-retry">
          <p class="profile-already-shared-retry__message">{{t
              "pages.profile-already-shared.retry.message"
              organization=@controller.model.campaign.organizationName
            }}</p>
          <LinkTo
            @route="campaigns.entry-point"
            @model={{@model.campaign.code}}
            @query={{@controller.query}}
            class="button button--link profile-already-shared-retry__button"
          >{{t "pages.profile-already-shared.retry.button"}}</LinkTo>
        </div>
      {{/if}}
      <div class="send-profile-header__profile">
        <HexagonScore
          @pixScore={{@controller.model.sharedProfile.pixScore}}
          @maxReachablePixScore={{@controller.model.sharedProfile.maxReachablePixScore}}
          @maxReachableLevel={{@controller.model.sharedProfile.maxReachableLevel}}
        />
        <div class="send-profile-header__profile__cards">
          <ProfileScorecards
            class="send-profile-header__profile__cards"
            @interactive={{false}}
            @areas={{@controller.model.sharedProfile.areas}}
            @scorecards={{@controller.model.sharedProfile.scorecards}}
          />
        </div>
      </div>
    </PixBlock>
  </div>
</template>
