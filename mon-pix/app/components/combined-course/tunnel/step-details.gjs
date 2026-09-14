import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item.js';

import Duration from '../duration';
import Level from '../level';

<template>
  <div class="step-details">
    <div class="step-details__main">
      {{#if @item.iconUrl}}
        <div class="step-details__icon">
          <img role="presentation" src={{@item.iconUrl}} alt="" />
        </div>
      {{/if}}
      <h1 class="step-details__title">{{@item.title}}</h1>
      {{#if @item.description}}
        <p class="step-details__description">{{@item.description}}</p>
      {{else}}
        <p class="step-details__description">TODO : display description from item</p>
      {{/if}}
      {{#if @item.objectives}}
        <ul class="step-details__objectives">
          {{#each @item.objectives as |objective|}}
            <PixIcon @icon="chevronRight" /><li class="step-details__objectives--item">{{objective}}</li>
          {{/each}}
        </ul>
      {{else}}
        <ul class="step-details__objectives">
          <PixIcon @icon="chevronRight" /><li class="step-details__objectives--item">Objectif 1</li>
          <PixIcon @icon="chevronRight" /><li class="step-details__objectives--item">Objectif 2</li>
        </ul>
      {{/if}}
    </div>

    <PixButton class="step-details__cta" @triggerAction={{@onClick}}>
      {{#if (eq @item.type CombinedCourseItemTypes.CAMPAIGN)}}
        {{t "pages.combined-courses.items.start-campaign"}}
      {{else}}
        {{t "pages.combined-courses.items.start-module"}}
      {{/if}}
    </PixButton>

    <div class="step-details__indicators">
      {{#if @item.level}}
        <Level @level={{@item.level}} />
      {{else}}
        <Level @level="intermediate" />
      {{/if}}
      {{#if @item.duration}}
        <Duration @duration={{@item.duration}} />
      {{else}}
        <Duration @duration="10" />
      {{/if}}
    </div>

  </div>
</template>
