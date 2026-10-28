import { PixButton, PixIcon, PixStars } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { and, not } from 'ember-truth-helpers';
import autofocus from 'mon-pix/modifiers/autofocus.js';
import scrollIntoView from 'mon-pix/modifiers/scroll-into-view.js';

import Duration from './duration';

const Content = <template>
  <div
    class="combined-course-item
      {{if @hasWhiteBackground 'combined-course-item--white'}}
      {{if @isCurrentItem 'combined-course-item--current'}}
      {{if @isCampaignType 'combined-course-item--isCampaignType'}}
      {{if @canReplay 'combined-course-item--replayable'}}
      {{if (and @isCampaignType @isCompleted) 'combined-course-item--completed-campaign'}}"
    aria-details={{if @isCurrentItem "step-details"}}
    ...attributes
  >
    <div class="combined-course-item__main">
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

          {{#if (has-block "campaignResultLink")}}
            <div class="combined-course-item__campaign-results">{{yield to="campaignResultLink"}}</div>
          {{/if}}
        </div>
      </div>

      {{#if (has-block "objectives")}}
        <div class="combined-course-item__objectives">{{yield to="objectives"}}</div>
      {{/if}}
    </div>

    {{#if @isLocked}}
      <div class="combined-course-item__indicator--locked">
        <PixIcon @name="lock" @plainIcon={{true}} @ariaHidden={{true}} />
      </div>
    {{/if}}
    {{#if @isCompleted}}
      {{#unless (and @isCurrentItem @isLoading)}}
        <div
          class="combined-course-item__indicator"
          aria-label={{if
            @isCampaignType
            (t "pages.combined-courses.items.aria-label-completed-campaign" value=@masteryRate)
          }}
        >
          <div class="combined-course-item__indicator--completed">
            {{#unless @isCampaignType}}
              <span class="combined-course-item__completion-field">{{t "pages.combined-courses.items.completed"}}</span>
            {{/unless}}
            <PixIcon
              @name="checkCircle"
              @plainIcon={{true}}
              class="combined-course-item__completion-icon"
              @ariaHidden={{true}}
            />
          </div>

          {{#if @canReplay}}
            <div class="combined-course-item__replay">
              <PixButton @triggerAction={{@onClick}} @variant="secondary">
                {{t "pages.combined-courses.items.retry-module"}}
              </PixButton>
            </div>
          {{/if}}
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
      {{/unless}}
    {{/if}}
    {{#if (has-block "blockEnd")}}
      {{yield to="blockEnd"}}
    {{/if}}
  </div>
</template>;

function hasWhiteBackground(item) {
  return item.isCompleted || !item.isLocked;
}

export default class CombinedCourseItem extends Component {
  @service intl;

  get campaignResultCTALabel() {
    if (this.args.item.isDiagnostic) {
      return this.intl.t('pages.combined-courses.items.result-cta.diagnostic');
    }

    return this.intl.t('pages.combined-courses.items.result-cta.campaign');
  }

  <template>
    {{#if @item.isFormationBloc}}
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
          @displayDuration={{@item.isModuleType}}
        >
          <:duration>
            {{#if @item.duration}}<Duration @duration={{@item.duration}} />{{/if}}
          </:duration>
        </Content>
      {{else if (and @isCombinedCourseCompleted @item.isModuleType)}}
        <Content
          @title={{@item.title}}
          @isCompleted={{@item.isCompleted}}
          @masteryRate={{@item.masteryRate}}
          @hasStagesStars={{@item.hasStagesStars}}
          @validatedStagesCount={{@item.validatedStages}}
          @totalStagesCount={{@item.totalStages}}
          @iconUrl={{@item.iconUrl}}
          @displayDuration={{false}}
          @hasWhiteBackground={{hasWhiteBackground @item}}
          @canReplay={{true}}
          @onClick={{@onClick}}
        >
          <:objectives>
            {{#if @item.objectives.length}}
              <p class="combined-course-item__objectives-title">{{t
                  "pages.combined-courses.items.module-objectives-completed"
                }}</p>
              <ul class="combined-course-item__objectives-list">
                {{#each @item.objectives as |objective|}}
                  <li class="combined-course-item__objectives-item">
                    <PixIcon
                      @name="checkCircle"
                      @plainIcon={{true}}
                      class="combined-course-item__objectives-icon"
                      @ariaHidden={{true}}
                    />
                    {{htmlSafe objective}}
                  </li>
                {{/each}}
              </ul>
            {{/if}}
          </:objectives>
        </Content>
      {{else if (and @item.isCampaignType @item.isCompleted @shouldDisplayCTA)}}
        <Content
          @title={{@item.title}}
          @isCompleted={{@item.isCompleted}}
          @masteryRate={{@item.masteryRate}}
          @hasStagesStars={{@item.hasStagesStars}}
          @validatedStagesCount={{@item.validatedStages}}
          @totalStagesCount={{@item.totalStages}}
          @iconUrl={{@item.iconUrl}}
          @isCampaignType={{true}}
          @displayDuration={{false}}
          @hasWhiteBackground={{hasWhiteBackground @item}}
          @isCurrentItem={{@isSelectedItem}}
          @isLoading={{@isLoading}}
          @onClick={{@onClick}}
        >
          <:campaignResultLink>
            {{#unless @isLoading}}
              <PixButton @variant="tertiary" @triggerAction={{@onClick}}>{{this.campaignResultCTALabel}}</PixButton>
            {{/unless}}
          </:campaignResultLink>
        </Content>
      {{else}}
        <button
          class="combined-course-item--selectable"
          type="button"
          {{on "click" @onClick}}
          data-testid="selectable-item-button"
          aria-describedby={{if @isSelectedItem "step-details-description step-details-objectives"}}
          {{autofocus @focusItem}}
          {{scrollIntoView @focusItem}}
        >
          <Content
            @title={{@item.title}}
            @isCompleted={{@item.isCompleted}}
            @masteryRate={{@item.masteryRate}}
            @hasStagesStars={{@item.hasStagesStars}}
            @validatedStagesCount={{@item.validatedStages}}
            @totalStagesCount={{@item.totalStages}}
            @iconUrl={{@item.iconUrl}}
            @isCampaignType={{@item.isCampaignType}}
            @displayDuration={{@item.isModuleType}}
            @hasWhiteBackground={{hasWhiteBackground @item}}
            @isCurrentItem={{@isSelectedItem}}
            @isLoading={{@isLoading}}
          >
            <:duration>
              {{#if @item.duration}}
                <Duration @duration={{@item.duration}} />
              {{/if}}
            </:duration>
            <:blockEnd>
              {{#if (and @isSelectedItem @shouldDisplayCTA)}}
                <PixButton class="combined-course-item__cta">{{t @item.ctaLabel}}</PixButton>
              {{/if}}
            </:blockEnd>
          </Content>
        </button>
      {{/if}}
    {{/if}}
  </template>
}
