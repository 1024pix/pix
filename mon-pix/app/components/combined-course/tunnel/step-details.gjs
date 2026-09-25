import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { fn } from '@ember/helper';
import { htmlSafe } from '@ember/template';
import t from 'ember-intl/helpers/t';
import { eq } from 'ember-truth-helpers';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item.js';

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
      {{#if @item.isCompleted}}
        <div class="step-details__indicator--completed">
          <span class="step-details__completion-field">{{t "pages.combined-courses.items.completed"}}</span>
          <PixIcon
            @name="checkCircle"
            @plainIcon={{true}}
            class="step-details__icon"
            @ariaHidden={{true}}
          />
        </div>
      {{/if}}
    </div>
    <h1 class="step-details__title">{{@item.title}}</h1>
    {{#if @item.description}}
      <p class="step-details__description">{{htmlSafe @item.description}}</p>
    {{/if}}
    {{#if @item.objectives}}
      <ul class="step-details__objectives">
        {{#each @item.objectives as |objective|}}
          <li class="step-details__objectives--item">
            <PixIcon @name="chevronRight" class="step-details__objectives--chevron" />
            {{htmlSafe objective}}
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </div>

  <PixButton class="step-details__cta" @triggerAction={{fn @onClick @item}}>
    {{#if (eq @item.type CombinedCourseItemTypes.CAMPAIGN)}}
      {{t "pages.combined-courses.items.start-campaign"}}
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
