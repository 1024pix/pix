import { PixIndicatorCard } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <PixIndicatorCard
    @title={{t "cards.submitted-count.title"}}
    @iconName="inboxIn"
    @color="green"
    @loadingMessage={{t "cards.submitted-count.loader"}}
    @isLoading={{@isLoading}}
    ...attributes
  >
    <:default>{{@value}}</:default>
  </PixIndicatorCard>
</template>
