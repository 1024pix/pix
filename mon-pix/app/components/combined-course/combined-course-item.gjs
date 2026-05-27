import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixStars from '@1024pix/pix-ui/components/pix-stars';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';
import { and, eq, not } from 'ember-truth-helpers';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';

const Content = <template>
  <div
    class="combined-course-item
      {{if @hasYellowBorder 'combined-course-item--yellow-border'}}
      {{if @hasWhiteBackground 'combined-course-item--white'}}
      {{if @isCurrentItem 'combined-course-item--current'}}
      {{if @isCampaignType 'combined-course-item--isCampaignType'}}"
    ...attributes
  >
    <div class="combined-course-item__content">
      <div class="combined-course-item__icon">
        {{#if @iconUrl}}
          <img role="presentation" src={{@iconUrl}} alt="" height="42" />
        {{/if}}
      </div>
      <div class="combined-course-item__text">
        <div class="combined-course-item__title">{{@title}}</div>
        {{#if @displayDuration}}
          <div class="combined-course-item__description">
            <span>{{yield to="description"}}</span>
            <span class="combined-course-item__duration">
              {{yield to="duration"}}
            </span>
          </div>
        {{/if}}
      </div>

    </div>
    {{#if @isLocked}}
      <div class="combined-course-item__indicator--locked">
        <PixIcon @name="lock" @plainIcon={{true}} @ariaHidden={{true}} />
      </div>
    {{/if}}
    {{#if @isCompleted}}
      <div
        class="combined-course-item__indicator"
        aria-label={{if
          @isCampaignType
          (t "pages.combined-courses.items.aria-label-completed-campaign" value=@masteryRate)
        }}
      >
        <div>
        </div>
        <div
          class="combined-course-item__indicator--completed
            {{if @hasYellowBorder 'combined-course-item__indicator--yellow'}}"
        >
          {{#unless @isCampaignType}}
            <span class="combined-course-item__completion-field">{{t "pages.combined-courses.items.completed"}}</span>
          {{/unless}}
          <PixIcon
            @name="checkCircle"
            @plainIcon={{true}}
            class="combined-course-item__icon {{if @hasYellowBorder 'combined-course-item__icon--yellow'}}"
            @ariaHidden={{true}}
          />
        </div>
      </div>
      {{#if @isCampaignType}}
        <div class="combined-course-item__campaign-indicators">

          <span class="combined-course-item--campaign">{{t "common.display.percentage" value=@masteryRate}}
            {{#if @hasStagesStars}}
              <PixStars
                @count={{@validatedStagesCount}}
                @total={{@totalStagesCount}}
                @alt={{t
                  "pages.combined-courses.items.aria-label-completed-campaign-with-stages"
                  acquired=@validatedStagesCount
                  total=@totalStagesCount
                }}
                class="combined-course-item__stars"
              />
            {{/if}}

          </span>
        </div>
      {{/if}}
    {{/if}}
    {{#if (has-block "blockEnd")}}
      {{yield to="blockEnd"}}
    {{/if}}
  </div>
</template>;

const Duration = <template>
  <PixIcon @name="acute" class="combined-course-item__duration__icon" @ariaHidden={{true}} />
  <span aria-label={{t "pages.combined-courses.items.aria-label-duration" duration=@item.duration}}>{{t
      "pages.combined-courses.items.duration"
      duration=@item.duration
    }}</span>
</template>;

function hasWhiteBackground(item) {
  return item.isCompleted || !item.isLocked;
}

<template>
  {{#if (eq @item.type CombinedCourseItemTypes.FORMATION)}}
    <Content
      @title={{t "pages.combined-courses.items.formation.title"}}
      @isLocked={{true}}
      @iconUrl={{@item.iconUrl}}
      class="combined-course-item--formation"
      @displayDuration={{true}}
    >
      <:description>
        <p>{{t "pages.combined-courses.items.formation.description"}}</p>
      </:description>
    </Content>
  {{else}}
    {{#if (and @isLocked (not @item.isCompleted))}}
      <Content
        @title={{@item.title}}
        @isLocked={{true}}
        @iconUrl={{@item.iconUrl}}
        @displayDuration={{eq @item.type "MODULE"}}
      >
        <:duration>
          {{#if @item.duration}}<Duration @item={{@item}} />{{/if}}
        </:duration>
      </Content>
    {{else}}
      <LinkTo
        {{on "click" @onClick}}
        @route={{@item.route}}
        @models={{@item.models}}
        @query={{hash redirection=@item.redirection}}
        disabled
      >
        <Content
          @title={{@item.title}}
          @isCompleted={{@item.isCompleted}}
          @masteryRate={{@item.masteryRate}}
          @hasStagesStars={{@item.hasStagesStars}}
          @validatedStagesCount={{@item.validatedStages}}
          @totalStagesCount={{@item.totalStages}}
          @iconUrl={{@item.iconUrl}}
          @isCampaignType={{eq @item.type "CAMPAIGN"}}
          @displayDuration={{eq @item.type "MODULE"}}
          @hasWhiteBackground={{hasWhiteBackground @item}}
          @hasYellowBorder={{and (eq @item.type "MODULE") @isCombinedCourseCompleted}}
          @isCurrentItem={{@isNextItemToComplete}}
        >
          <:duration>
            {{#if @item.duration}}
              <Duration @item={{@item}} />
            {{/if}}
          </:duration>
          <:blockEnd>
            {{#if @isNextItemToComplete}}
              <PixTag @color="purple-light" class="combined-course-item__tag">{{t
                  "pages.combined-courses.items.tagText"
                }}
                <PixIcon @name="distance" @plainIcon={{true}} @ariaHidden={{true}} /></PixTag>
            {{/if}}
          </:blockEnd>
        </Content>

      </LinkTo>
    {{/if}}
  {{/if}}
</template>
