import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import { t } from 'ember-intl';

<template>
  <section class="statistics">
    <PixIndicatorCard @title={{t "cards.available-seats-count.title"}} @color="success" @icon="users">
      {{@available}}
      <span class="statistics__total">{{t "cards.available-seats-count.value" total=@total}}</span>
    </PixIndicatorCard>
    <PixIndicatorCard @title={{t "cards.occupied-seats-count.title"}} @color="warning" @icon="users">
      {{@occupied}}
      <span class="statistics__total">{{t "cards.occupied-seats-count.value" total=@total}}</span>
    </PixIndicatorCard>
  </section>
</template>
