import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import { t } from 'ember-intl';

<template>
  <PixIndicatorCard
    @title={{if @isTypeAssessment (t "cards.submitted-count.title") (t "cards.submitted-count.title-profiles")}}
    @iconName="inboxIn"
    @color="green"
    @info={{t "cards.submitted-count.information"}}
    @loadingMessage={{t "cards.submitted-count.loader"}}
    @isLoading={{@isLoading}}
    ...attributes
  >
    <:default>{{@value}}</:default>
  </PixIndicatorCard>
</template>
