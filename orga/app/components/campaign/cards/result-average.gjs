import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import { t } from 'ember-intl';

<template>
  <PixIndicatorCard
    @title={{t "cards.participants-average-results.title"}}
    @icon="crown"
    @color="blue"
    @info={{t "cards.participants-average-results.information"}}
    @isLoading={{@isLoading}}
    class="indicator-card"
    ...attributes
  >
    <:default>{{t "common.result.percentage" value=@value}}</:default>
  </PixIndicatorCard>
</template>
