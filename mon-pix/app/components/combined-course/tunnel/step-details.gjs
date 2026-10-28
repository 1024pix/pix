import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { htmlSafe } from '@ember/template';
import t from 'ember-intl/helpers/t';
import { and, not, or } from 'ember-truth-helpers';

import Duration from '../duration';
import Level from '../level';

<template>
  <div class="step-details__main">
    <div class="step-details__heading">
      {{#if @item.iconUrl}}
        <div class="step-details__icon">
          <img role="presentation" src={{@item.iconUrl}} alt="" />
        </div>
      {{/if}}
      {{#if (and @item.isCompleted (not @isLoading))}}
        <div class="step-details__indicator--completed">
          <span class="step-details__completion-field">{{t "pages.combined-courses.items.completed"}}</span>
          <PixIcon @name="checkCircle" @plainIcon={{true}} class="step-details__icon" @ariaHidden={{true}} />
        </div>
      {{/if}}
    </div>
    <h1 class="step-details__title">{{@item.title}}</h1>
    {{#if (or @item.description @item.objectives.length)}}
      <div class="step-details__summary" aria-live="polite" aria-atomic="true">
        {{#if @item.description}}
          <p class="step-details__description" id="step-details-description">{{htmlSafe @item.description}}</p>
        {{/if}}
        {{#if @item.objectives}}
          <ul class="step-details__objectives" id="step-details-objectives">
            {{#each @item.objectives as |objective|}}
              <li class="step-details__objectives--item">
                <PixIcon @name="chevronRight" class="step-details__objectives--chevron" @ariaHidden={{true}} />
                {{htmlSafe objective}}
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </div>
    {{/if}}
  </div>

  <PixButton class="step-details__cta" @triggerAction={{fn @onClick @item}} @isLoading={{@isLoading}}>
    {{#if (and @item.isCampaignType @item.isCompleted)}}
      {{#if @item.isDiagnostic}}
        {{t "pages.combined-courses.items.result-cta.diagnostic"}}
      {{else}}
        {{t "pages.combined-courses.items.result-cta.campaign"}}
      {{/if}}
    {{else if @item.isCampaignType}}
      {{t "pages.combined-courses.items.start-campaign"}}
    {{else if @item.isCompleted}}
      {{t "pages.combined-courses.items.restart-module"}}
    {{else}}
      {{t "pages.combined-courses.items.start-module"}}
    {{/if}}
  </PixButton>

  <div class="step-details__indicators">
    {{#if @item.level}}
      <Level @level={{@item.level}} />
    {{/if}}
    {{#if @item.duration}}
      <Duration @duration={{@item.duration}} />
    {{/if}}
  </div>
</template>
