import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import { t } from 'ember-intl';

<template>
  <section class="statistics">
    <PixIndicatorCard @title={{t "cards.available-seats-count.title"}} @color="success" @icon="users">
      {{@model.available}}
      <span class="statistics__total">{{t "cards.available-seats-count.value" total=@model.total}}</span>
    </PixIndicatorCard>
    <PixIndicatorCard @title={{t "cards.occupied-seats-count.title"}} @color="warning" @icon="users">
      <:default>
        {{@model.occupied}}

        <span class="statistics__total">{{t "cards.occupied-seats-count.value" total=@model.total}}</span>
      </:default>

      <:sub>
        {{#if @model.hasAnonymousSeat}}
          <span>{{t "cards.occupied-seats-count.anonymous" count=@model.anonymousSeat}}</span>
        {{/if}}
      </:sub>
    </PixIndicatorCard>
  </section>
</template>
