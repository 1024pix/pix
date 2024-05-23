import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import { t } from 'ember-intl';

<template>
  <PixIndicatorCard
    @title={{t "cards.participants-count.title"}}
    @icon="users"
    @color="blue"
    @info={{t "cards.participants-count.information"}}
    @loadingMessage={{t "cards.participants-count.loader"}}
    @isLoading={{@isLoading}}
    ...attributes
  >
    <:default>{{@value}}</:default>
  </PixIndicatorCard>
</template>
