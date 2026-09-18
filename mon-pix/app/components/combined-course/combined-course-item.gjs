import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixStars from '@1024pix/pix-ui/components/pix-stars';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';
import { and, eq, not } from 'ember-truth-helpers';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';

import Duration from './duration';

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
          <img role="presentation" src={{@iconUrl}} alt="" />
        {{/if}}
      </div>
      <div class="combined-course-item__text">
        <div class="combined-course-item__title">{{@title}}
        </div>

        <div class="combined-course-item__description">
          <span>{{yield to="description"}}</span>

          {{#if @displayDuration}}
            <span class="combined-course-item__duration">
              {{yield to="duration"}}
            </span>
          {{/if}}
        </div>
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
      @displayDuration={{false}}
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
        @displayDuration={{eq @item.type CombinedCourseItemTypes.MODULE}}
      >
        <:duration>
          {{#if @item.duration}}<Duration @duration={{@item.duration}} />{{/if}}
        </:duration>
      </Content>
    {{else}}
      <button
        class="combined-course-item--selectable"
        type="button"
        {{on "click" @onClick}}
        data-testid="selectable-item-button"
      >
        <Content
          @title={{@item.title}}
          @isCompleted={{@item.isCompleted}}
          @masteryRate={{@item.masteryRate}}
          @hasStagesStars={{@item.hasStagesStars}}
          @validatedStagesCount={{@item.validatedStages}}
          @totalStagesCount={{@item.totalStages}}
          @iconUrl={{@item.iconUrl}}
          @isCampaignType={{eq @item.type CombinedCourseItemTypes.CAMPAIGN}}
          @displayDuration={{eq @item.type CombinedCourseItemTypes.MODULE}}
          @hasWhiteBackground={{hasWhiteBackground @item}}
          @hasYellowBorder={{and (eq @item.type CombinedCourseItemTypes.MODULE) @isCombinedCourseCompleted}}
          @isCurrentItem={{@isSelectedItem}}
        >
          <:duration>
            {{#if @item.duration}}
              <Duration @duration={{@item.duration}} />
            {{/if}}
          </:duration>
          <:blockEnd>
            {{#if @isSelectedItem}}
              {{#if @displayNextItemTag}}
                <PixTag @color="purple-light" class="combined-course-item__tag">{{t
                    "pages.combined-courses.items.tagText"
                  }}
                  <PixIcon @name="distance" @plainIcon={{true}} @ariaHidden={{true}} /></PixTag>
              {{/if}}
            {{/if}}
          </:blockEnd>
        </Content>
      </button>
    {{/if}}
  {{/if}}
</template>
