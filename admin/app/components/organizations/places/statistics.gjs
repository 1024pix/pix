import { PixIndicatorCard } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <section class="statistics">
    <PixIndicatorCard
      @title={{t "components.organizations.places.statistics.available-seats-count.title"}}
      @color="success"
      @iconName="users"
    >
      {{@statistics.available}}
      <span class="statistics__total">{{t
          "components.organizations.places.statistics.available-seats-count.value"
          total=@statistics.total
        }}</span>
    </PixIndicatorCard>
    <PixIndicatorCard
      @title={{t "components.organizations.places.statistics.occupied-seats-count.title"}}
      @color="warning"
      @iconName="users"
    >
      <:default>
        {{@statistics.occupied}}

        <span class="statistics__total">{{t
            "components.organizations.places.statistics.occupied-seats-count.value"
            total=@statistics.total
          }}</span>
      </:default>

      <:sub>
        {{#if @statistics.hasAnonymousSeat}}
          <span>{{t
              "components.organizations.places.statistics.occupied-seats-count.anonymous"
              count=@statistics.anonymousSeat
            }}</span>
        {{/if}}
      </:sub>
    </PixIndicatorCard>
  </section>
</template>
